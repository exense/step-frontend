import { CollectionViewer, DataSource } from '@angular/cdk/collections';
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
import { TableRestService } from '../../../client/table/services/table-rest.service';
import { TableRequestData } from '../../../client/table/models/table-request-data';
import { TableResponse } from '../../../client/table/models/table-response';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TableDataSource } from './table-data-source';
import { SearchValue } from './search-value';

export class TableRequest {
  columns: string[];
  searchBy: { column: string; search: string; regex: boolean }[];
  orderBy?: { column: string; order: 'asc' | 'desc' };
  start?: number;
  length?: number;
  filter?: string;
  params?: unknown;

  constructor(data?: Partial<TableRequest>) {
    this.columns = data?.columns || [];
    this.searchBy = data?.searchBy || [];
    this.orderBy = data?.orderBy || undefined;
    this.start = data?.start || undefined;
    this.length = data?.length || undefined;
    this.filter = data?.filter || undefined;
    this.params = data?.params || undefined;
  }
}

const convertTableRequest = (req: TableRequest): TableRequestData => {
  const result: TableRequestData = {
    draw: 1,
    columns: [],
    start: req.start || 0,
    length: req.length || 10,
    order: [],
    search: {
      value: '',
      regex: false,
    },
    filter: req.filter,
    params: req.params,
  };

  result.columns = req.columns.map((name) => {
    const searchColumn = (req.searchBy || []).find((s) => s.column === name);
    return searchColumn
      ? {
          name,
          searchable: true,
          search: {
            value: searchColumn.search,
            regex: searchColumn.regex,
          },
        }
      : { name };
  });

  let orderColumnIndex = 0; //if not specified otherwise, the first column is sorted ascendingly
  if (!!req.orderBy && req.columns.indexOf(req.orderBy.column) >= 0) {
    orderColumnIndex = req.columns.indexOf(req.orderBy.column);
  }
  result.columns[orderColumnIndex].orderable = true;
  result.order = [
    {
      column: orderColumnIndex,
      dir: !!req.orderBy?.order ? req.orderBy.order : 'asc',
    },
  ];

  return result;
};

export class TableRemoteDataSource<T> implements TableDataSource<T> {
  private _terminator$ = new Subject<any>();
  private _inProgress$ = new BehaviorSubject<boolean>(false);
  readonly inProgress$ = this._inProgress$.asObservable();
  private _request$ = new BehaviorSubject<TableRequest | undefined>(undefined);
  private _response$: Observable<TableResponse | null> = this._request$.pipe(
    filter((x) => !!x),
    map((x) => convertTableRequest(x!)),
    tap((_) => this._inProgress$.next(true)),
    switchMap((request) => this._rest.requestTable(this._tableId, request)),
    catchError((err) => {
      console.error(err);
      return of(null);
    }),
    tap((_) => this._inProgress$.next(false)),
    startWith(null),
    shareReplay(1),
    takeUntil(this._terminator$)
  ) as Observable<TableResponse | null>;
  readonly data$: Observable<T[]> = this._response$.pipe(
    map((r) => r?.data || []),
    map((items) => items.map((x) => JSON.parse(x[0]) as T))
  );
  readonly total$ = this._response$.pipe(map((r) => r?.recordsTotal || 0));
  readonly totalFiltered$ = this._response$.pipe(map((r) => r?.recordsFiltered || 0));
  private typeFilter?: { [key: string]: string };

  constructor(
    private _tableId: string,
    private _rest: TableRestService,
    private _requestColumnsMap: { [key: string]: string },
    private _typeFilter?: [string]
  ) {
    if (_typeFilter) {
      this.typeFilter = { type: _typeFilter.join('|') };
    }
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.data$;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._request$.complete();
    this._inProgress$.complete();
    this._terminator$.next(undefined);
    this._terminator$.complete();
  }

  getTableData(page?: PageEvent, sort?: Sort, search?: { [key: string]: SearchValue }): void;
  getTableData(req: TableRequest): void;
  getTableData(
    reqOrPage: TableRequest | PageEvent | undefined,
    sort?: Sort,
    search?: { [key: string]: SearchValue },
    filter?: string,
    params?: unknown
  ): void {
    if (this.typeFilter) {
      search = { ...search, ...this.typeFilter };
    }

    if (arguments.length === 1 && reqOrPage instanceof TableRequest) {
      const req = reqOrPage as TableRequest;
      this._request$.next(req);
      return;
    }

    const page = reqOrPage as PageEvent | undefined;

    const tableRequest: TableRequest = new TableRequest({
      columns: Object.values(this._requestColumnsMap),
      searchBy: Object.entries(search || {})
        .map(([name, searchValue]) => {
          const column = this._requestColumnsMap[name];
          let search: string;
          let regex: boolean;

          if (typeof searchValue === 'string') {
            search = searchValue;
            regex = false;
          } else {
            search = searchValue?.value || '';
            regex = searchValue?.regex || false;
          }

          return { column, search, regex };
        })
        .filter((x) => !!x.search),
    });

    if (filter) {
      tableRequest.filter = filter;
    }

    if (params) {
      tableRequest.params = params;
    }

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

  reload() {
    this._request$.next(this._request$.value);
  }

  exportAsCSV(params?: unknown): void {
    this._rest.exportAsCSV(this._tableId, params);
  }
}
