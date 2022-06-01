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
import { TableRestService } from '../services/api/table-rest.service';
import { TableRequestData } from '../services/api/dto/table-request-data';
import { TableResponse } from '../services/api/dto/table-response';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TableDataSource } from './table-data-source';

export class TableRequest {
  constructor(data?: Partial<TableRequest>) {
    this.columns = data?.columns || [];
    this.searchBy = data?.searchBy || [];
    this.orderBy = data?.orderBy || undefined;
    this.start = data?.start || undefined;
    this.length = data?.length || undefined;
  }

  columns: string[];
  searchBy: { column: string; search: string; regex: boolean }[];
  orderBy?: { column: string; order: 'asc' | 'desc' };
  start?: number;
  length?: number;
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

  const orderColumnIndex = !!req.orderBy ? req.columns.indexOf(req.orderBy.column) : -1;
  if (orderColumnIndex >= 0) {
    result.columns[orderColumnIndex].orderable = true;
    result.order = [
      {
        column: orderColumnIndex,
        dir: req.orderBy!.order,
      },
    ];
  }

  return result;
};

export class TableRemoteDataSource<T> implements TableDataSource<T> {
  private _terminator$ = new Subject<any>();
  private _inProgress$ = new BehaviorSubject<boolean>(false);
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

  readonly inProgress$ = this._inProgress$.asObservable();

  constructor(
    private _tableId: string,
    private _rest: TableRestService,
    private _requestColumnsMap: { [key: string]: string }
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.data$;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._request$.complete();
    this._inProgress$.complete();
    this._terminator$.next(undefined);
    this._terminator$.complete();
  }

  getTableData(page?: PageEvent, sort?: Sort, search?: { [key: string]: string }): void;
  getTableData(req: TableRequest): void;
  getTableData(reqOrPage: TableRequest | PageEvent | undefined, sort?: Sort, search?: { [key: string]: string }): void {
    if (arguments.length === 1 && reqOrPage instanceof TableRequest) {
      const req = reqOrPage as TableRequest;
      this._request$.next(req);
      return;
    }

    const page = reqOrPage as PageEvent | undefined;

    const tableRequest: TableRequest = new TableRequest({
      columns: Object.values(this._requestColumnsMap),
      searchBy: Object.entries(search || {})
        .map(([name, search]) => ({
          column: this._requestColumnsMap[name],
          regex: false,
          search,
        }))
        .filter((x) => !!x.search),
    });

    if (page) {
      tableRequest.start = page.pageIndex * page.pageSize;
      tableRequest.length = page.pageSize;
    }

    const order = sort?.direction;
    if (order) {
      const column = this._requestColumnsMap[sort.active];
      tableRequest.orderBy = column ? { column, order } : undefined;
    } else {
      tableRequest.orderBy = {
        column: this._requestColumnsMap['name'],
        order: 'asc',
      };
    }

    this.getTableData(tableRequest);
  }

  reload() {
    this._request$.next(this._request$.value);
  }
}
