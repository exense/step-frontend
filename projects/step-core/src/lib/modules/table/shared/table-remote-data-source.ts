import { CollectionViewer } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  exhaustMap,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import {
  SortDirection,
  TableRequestData,
  TableApiWrapperService,
  TableResponseGeneric,
  TableRequestFilter,
  OQLFilter,
  TableParameters,
  StepDataSourceReloadOptions,
} from '../../../client/step-client-module';
import { TableDataSource, TableFilterOptions, TableGetDataOptions } from './table-data-source';
import { SearchValue } from './search-value';
import { FilterCondition } from './filter-condition';

export class TableRequestInternal {
  columns: string[];
  searchBy?: { column: string; value: SearchValue }[];
  orderBy?: { column: string; order: 'asc' | 'desc' };
  start?: number;
  length?: number;
  filter?: string;
  params?: TableParameters;

  constructor(data?: Partial<TableRequestInternal>) {
    this.columns = data?.columns || [];
    this.searchBy = data?.searchBy || [];
    this.orderBy = data?.orderBy || undefined;
    this.start = data?.start || undefined;
    this.length = data?.length || undefined;
    this.filter = data?.filter || undefined;
    this.params = data?.params || undefined;
  }
}

const convertFilter = (field: string, searchValue: SearchValue): Array<TableRequestFilter | undefined> => {
  if (!searchValue) {
    return [undefined];
  }

  if (typeof searchValue === 'string') {
    return [{ field, value: searchValue, regex: false }];
  }

  if (searchValue instanceof FilterCondition) {
    return searchValue.toRequestFilter(field);
  }

  const value: string = searchValue?.value || '';
  const regex: boolean = searchValue?.regex || false;

  if (!value) {
    return [undefined];
  }

  return [{ field, value, regex }];
};

const convertTableRequest = (req: TableRequestInternal): TableRequestData => {
  const result: TableRequestData = {
    skip: req.start || 0,
    limit: req.length || 10,
  };

  const filters = (req.searchBy || [])
    .map(({ column, value }) => convertFilter(column, value))
    .reduce((result, filters) => [...result, ...filters], [])
    .filter((x) => !!x) as TableRequestFilter[];

  if (filters.length > 0) {
    result.filters = filters;
  }

  result.sort = req.orderBy
    ? {
        field: req.orderBy.column,
        direction: req.orderBy.order === 'asc' ? SortDirection.ASCENDING : SortDirection.DESCENDING,
      }
    : {
        field: req.columns[0],
        direction: SortDirection.ASCENDING,
      };

  if (req.filter) {
    const oql: OQLFilter = { oql: req.filter };
    result.filters = !!result.filters ? [...result.filters, oql] : [oql];
  }

  if (req.params) {
    result.tableParameters = req.params;
  }

  return result;
};

interface RequestContainer extends StepDataSourceReloadOptions {
  request: TableRequestInternal;
}

export class TableRemoteDataSource<T> implements TableDataSource<T> {
  private _terminator$ = new Subject<void>();
  private _inProgress$ = new BehaviorSubject<boolean>(false);
  readonly inProgress$ = this._inProgress$.asObservable();
  private isSharable = false;
  private isSkipOngoingRequest?: boolean;
  private _request$ = new BehaviorSubject<RequestContainer | undefined>(undefined);
  private _response$: Observable<TableResponseGeneric<T> | null> = this._request$.pipe(
    tap((x) => {
      this.isSkipOngoingRequest = false;
    }),
    filter((x) => !!x),
    debounceTime(500),
    map((x) => {
      const request = convertTableRequest(x!.request);

      // Don't show progress bar, when immediateHideProgress flag is passed
      // or hideProgress is passed and there is no in progress current operation
      let inProgress = true;
      if (!!x?.immediateHideProgress || (!!x?.hideProgress && !this._inProgress$.value)) {
        inProgress = false;
      }

      return { request, inProgress };
    }),
    tap((x) => {
      this._inProgress$.next(x.inProgress);
    }),
    exhaustMap((x) =>
      this._rest.requestTable<T>(this._tableId, x.request).pipe(
        catchError((err) => {
          return of(null);
        }),
      ),
    ),
    tap(() => {
      this._inProgress$.next(false);
    }),
    startWith(null),
    shareReplay(1),
    filter(() => !this.isSkipOngoingRequest),
    takeUntil(this._terminator$),
  ) as Observable<TableResponseGeneric<T> | null>;
  readonly data$: Observable<T[]> = this._response$.pipe(map((r) => r?.data || []));

  readonly total$ = this._response$.pipe(map((r) => r?.recordsTotal || 0));
  readonly totalFiltered$ = this._response$.pipe(map((r) => r?.recordsFiltered || 0));
  readonly forceNavigateToFirstPage$ = this._response$.pipe(
    map((r) => {
      const recordsInPage = (r?.data || []).length;
      const recordsFiltered = r?.recordsFiltered || 0;
      return recordsFiltered > 0 && recordsInPage === 0;
    }),
    filter((forceNavigate) => forceNavigate === true),
  );

  private filters: { [key: string]: SearchValue } = {};

  constructor(
    private _tableId: string,
    private _rest: TableApiWrapperService,
    private _requestColumnsMap: Record<string, string>,
    private _filters?: Record<string, string[]>,
  ) {
    if (_filters) {
      for (const key in _filters) {
        const filter = _filters[key];
        if (filter.length === 1) {
          this.filters[key] = filter[0];
        } else {
          this.filters[key] = { value: `(${filter.join('|')})`, regex: true };
        }
      }
    }
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.data$;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    if (!this.isSharable) {
      this.destroy();
    }
  }

  sharable(): this {
    this.isSharable = true;
    return this;
  }

  destroy(): void {
    this._request$.complete();
    this._inProgress$.complete();
    this._terminator$.next();
    this._terminator$.complete();
  }

  private createInternalRequestObject({ params, filter, search }: TableFilterOptions = {}): TableRequestInternal {
    if (Object.keys(this.filters).length > 0) {
      search = { ...(search || {}), ...this.filters };
    }

    const tableRequest: TableRequestInternal = new TableRequestInternal({
      columns: Object.values(this._requestColumnsMap),
      searchBy: Object.entries(search || {}).map(([name, value]) => {
        const column = this._requestColumnsMap[name] ?? name;
        return { column, value };
      }),
    });

    if (filter) {
      tableRequest.filter = filter;
    }

    if (params) {
      tableRequest.params = params;
    }

    return tableRequest;
  }

  getTableData(options?: TableGetDataOptions): void;
  getTableData(req: TableRequestInternal): void;
  getTableData(reqOrOptions: TableRequestInternal | TableGetDataOptions | undefined): void {
    if (reqOrOptions instanceof TableRequestInternal) {
      const req = reqOrOptions as TableRequestInternal;
      this._request$.next({ request: req });
      return;
    }

    let { page, sort, search, params, filter } = (reqOrOptions || {}) as TableGetDataOptions;

    const tableRequest = this.createInternalRequestObject({ search, filter, params });

    if (page) {
      tableRequest.start = page.pageIndex * page.pageSize;
      tableRequest.length = page.pageSize;
    }

    const order = sort?.direction;
    if (order) {
      const column = this._requestColumnsMap[sort!.active];
      tableRequest.orderBy = column ? { column, order } : undefined;
    }

    this.getTableData(tableRequest);
  }

  setColumnMap(key: string, value: string): void {
    this._requestColumnsMap[key] = value;
  }

  reload(reloadOptions?: StepDataSourceReloadOptions) {
    let val = this._request$.value ?? { request: {} as TableRequestInternal };
    val.hideProgress = reloadOptions?.hideProgress;
    val.immediateHideProgress = reloadOptions?.immediateHideProgress;
    this._request$.next(val);
  }

  getFilterRequest(options?: TableFilterOptions): TableRequestData | undefined {
    if (!options?.search && !options?.filter && !options?.params) {
      return undefined;
    }
    return convertTableRequest(this.createInternalRequestObject(options));
  }

  exportAsCSV(fields: string[], params?: TableParameters): void {
    const request = new TableRequestInternal({
      ...(this._request$.value?.request || {}),
      params,
    });

    const tableRequest = convertTableRequest(request);
    delete tableRequest.skip;
    delete tableRequest.limit;

    this._rest.exportAsCSV(this._tableId, fields, tableRequest).subscribe();
  }

  skipOngoingRequest(): void {
    this.isSkipOngoingRequest = true;
  }
}
