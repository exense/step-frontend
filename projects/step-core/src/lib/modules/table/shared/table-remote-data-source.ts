import { CollectionViewer } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  SortDirection,
  TableRequestData,
  TableApiWrapperService,
  TableResponseGeneric,
} from '../../../client/table/step-table-client.module';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TableDataSource } from './table-data-source';
import { SearchValue } from './search-value';
import { OQLFilter, TableParameters } from '../../../client/generated';
import { TableRequestFilter } from '../../../client/table/models/table-request-data';
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

export class TableRemoteDataSource<T> implements TableDataSource<T> {
  private _terminator$ = new Subject<any>();
  private _inProgress$ = new BehaviorSubject<boolean>(false);
  readonly inProgress$ = this._inProgress$.asObservable();
  private _request$ = new BehaviorSubject<{ request: TableRequestInternal; hideProgress?: boolean } | undefined>(
    undefined
  );
  private _response$: Observable<TableResponseGeneric<T> | null> = this._request$.pipe(
    filter((x) => !!x),
    map((x) => {
      return { request: convertTableRequest(x!.request), hideProgress: x?.hideProgress };
    }),
    tap((x) => {
      this._inProgress$.next(!x.hideProgress);
    }),
    switchMap((x) => this._rest.requestTable<T>(this._tableId, x.request)),
    catchError((err) => {
      console.error(err);
      return of(null);
    }),
    tap((_) => this._inProgress$.next(false)),
    startWith(null),
    shareReplay(1),
    takeUntil(this._terminator$)
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
    filter((forceNavigate) => forceNavigate === true)
  );

  private typeFilter?: { [key: string]: SearchValue };

  constructor(
    private _tableId: string,
    private _rest: TableApiWrapperService,
    private _requestColumnsMap: { [key: string]: string },
    private _typeFilter?: string[]
  ) {
    if (_typeFilter) {
      if (_typeFilter.length === 1) {
        this.typeFilter = { type: _typeFilter[0] };
      } else {
        this.typeFilter = { type: { value: `(${_typeFilter.join('|')})`, regex: true } };
      }
    }
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.data$;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    // While datasources exist in services, subjects completion don't allow to reuse them
    // TODO the lines below should be uncommented back while SED-1243 implementation
    // this._request$.complete();
    // this._inProgress$.complete();
    // this._terminator$.next(undefined);
    // this._terminator$.complete();
  }

  private createInternalRequestObject(
    search?: { [key: string]: SearchValue },
    filter?: string,
    params?: TableParameters
  ): TableRequestInternal {
    const tableRequest: TableRequestInternal = new TableRequestInternal({
      columns: Object.values(this._requestColumnsMap),
      searchBy: Object.entries(search || {}).map(([name, value]) => {
        const column = this._requestColumnsMap[name];
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

  getTableData(page?: PageEvent, sort?: Sort, search?: { [key: string]: SearchValue }): void;
  getTableData(req: TableRequestInternal): void;
  getTableData(
    reqOrPage: TableRequestInternal | PageEvent | undefined,
    sort?: Sort,
    search?: { [key: string]: SearchValue },
    filter?: string,
    params?: TableParameters
  ): void {
    if (this.typeFilter) {
      search = { ...search, ...this.typeFilter };
    }

    if (arguments.length === 1 && reqOrPage instanceof TableRequestInternal) {
      const req = reqOrPage as TableRequestInternal;
      this._request$.next({ request: req });
      return;
    }

    const tableRequest = this.createInternalRequestObject(search, filter, params);

    const page = reqOrPage as PageEvent | undefined;

    if (page) {
      tableRequest.start = page.pageIndex * page.pageSize;
      tableRequest.length = page.pageSize;
    }

    const order = sort?.direction;
    if (order) {
      const column = this._requestColumnsMap[sort.active];
      tableRequest.orderBy = column ? { column, order } : undefined;
    }

    this.getTableData(tableRequest);
  }

  setColumnMap(key: string, value: string): void {
    this._requestColumnsMap[key] = value;
  }

  reload(reloadOptions?: { hideProgress: boolean }) {
    let val = this._request$.value;
    val!.hideProgress = reloadOptions?.hideProgress;
    this._request$.next(val);
  }

  getFilterRequest(
    search?: { [p: string]: SearchValue },
    filter?: string,
    params?: TableParameters
  ): TableRequestData | undefined {
    if (!search && !filter && !params) {
      return undefined;
    }
    return convertTableRequest(this.createInternalRequestObject(search, filter, params));
  }

  exportAsCSV(fields: string[], params?: TableParameters): void {
    const request = new TableRequestInternal({
      ...(this._request$.value || {}),
      params,
    });

    const tableRequest = convertTableRequest(request);
    delete tableRequest.skip;
    delete tableRequest.limit;

    this._rest.exportAsCSV(this._tableId, fields, tableRequest);
  }
}
