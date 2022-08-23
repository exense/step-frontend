import { TableDataSource } from './table-data-source';
import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { SearchValue } from './search-value';
import { TableRequestData } from '../../../client/table/models/table-request-data';
import { TableParameters } from '../../../client/generated';

interface Request {
  page?: PageEvent;
  sort?: Sort;
  search?: { [key: string]: SearchValue };
}

export type SearchPredicate<T> = (item: T, searchValue: string) => boolean;
export type SortPredicate<T> = (itemA: T, itemB: T) => number;

const isSimpleType = (value: any) => ['string', 'number', 'boolean'].includes(typeof value);

export interface TableLocalDataSourceConfig<T> {
  searchPredicates?: { [columnName: string]: SearchPredicate<T> };
  sortPredicates?: { [columnName: string]: SortPredicate<T> };
}

export class TableLocalDataSource<T> implements TableDataSource<T> {
  private _terminator$ = new Subject<any>();
  private _source$: Observable<T[]>;

  private _request$ = new BehaviorSubject<Request>({});

  readonly inProgress$: Observable<boolean> = of(false);

  readonly total$: Observable<number>;
  readonly data$: Observable<T[]>;
  readonly totalFiltered$: Observable<number>;

  constructor(source: T[] | Observable<T[]>, private _config: TableLocalDataSourceConfig<T> = {}) {
    const source$ = source instanceof Array ? of(source) : source;
    this._source$ = source$.pipe(takeUntil(this._terminator$));

    const requestResult$ = combineLatest([this._source$, this._request$]).pipe(
      map(([src, req]) => {
        let total = 0;
        let totalFiltered = 0;

        if (!req?.page && !req.search && !req.sort) {
          return {
            total,
            totalFiltered,
            data: [],
          };
        }

        total = src.length;

        let data = this.applySearch(src, req.search);
        totalFiltered = data.length;

        data = this.applySort(data, req.sort);
        data = this.applyPage(data, req.page);

        return {
          data,
          total,
          totalFiltered,
        };
      })
    );

    this.total$ = requestResult$.pipe(map((r) => r.total));
    this.totalFiltered$ = requestResult$.pipe(map((r) => r.totalFiltered));
    this.data$ = requestResult$.pipe(map((r) => r.data));
  }

  private applySearch(source: T[], search?: { [key: string]: SearchValue }): T[] {
    if (!search || Object.keys(search).length === 0) {
      return source;
    }

    const predicates = Object.entries(search)
      .map(([column, value]) => {
        let searchValue = typeof value === 'string' ? value : value?.value;
        searchValue = (searchValue || '').trim().toLowerCase();

        if (!searchValue) {
          return undefined;
        }

        let columnPredicate: (item: T) => boolean;

        const predicate = this._config?.searchPredicates?.[column];
        if (!!predicate) {
          columnPredicate = (item: T) => predicate(item, searchValue);
        } else {
          columnPredicate = (item: T) => {
            const itemValue = isSimpleType(item)
              ? ((item as any) || '').toString()
              : ((item || {})[column] || '').toString();

            return itemValue.trim().toLowerCase().includes(searchValue);
          };
        }

        return columnPredicate;
      })
      .filter((p) => !!p);

    if (predicates.length === 0) {
      return source;
    }

    const wholePredicate = (item: T) => predicates.reduce((res, p) => res && p!(item), true);

    return source.filter(wholePredicate);
  }

  private applySort(source: T[], sort?: Sort): T[] {
    const sortBy = sort?.active;
    if (!sortBy) {
      return source;
    }

    const defaultSortPredicate = (itemA: T, itemB: T) => {
      const colValueA = isSimpleType(itemA)
        ? ((itemA as any) || '').toString()
        : ((itemA || {})[sortBy] || '').toString();

      const colValueB = isSimpleType(itemB)
        ? ((itemB as any) || '').toString()
        : ((itemB || {})[sortBy] || '').toString();

      return colValueA.localeCompare(colValueB);
    };

    const sortPredicate = this._config?.sortPredicates?.[sort.active] || defaultSortPredicate;

    const result = [...source];

    result.sort((a, b) => {
      let sortRes = sortPredicate(a, b);
      if (sort.direction === 'desc') {
        sortRes *= -1;
      }
      return sortRes;
    });

    return result;
  }

  private applyPage(source: T[], page?: PageEvent): T[] {
    if (!page) {
      return [];
    }
    const start = page.pageIndex * page.pageSize;
    const length = page.pageSize;
    return source.slice(start, start + length);
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.data$;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._terminator$.next(undefined);
    this._terminator$.complete();
    this._request$.complete();
  }

  getTableData(page?: PageEvent, sort?: Sort, search?: { [key: string]: SearchValue }): void {
    const request = { ...this._request$.value };
    request.page = page || request.page;
    request.sort = sort || request.sort;
    request.search = search || request.search;
    this._request$.next(request);
  }

  reload(): void {
    this._request$.next(this._request$.value);
  }

  getFilterRequest(
    search?: { [p: string]: SearchValue },
    filter?: string,
    params?: TableParameters
  ): TableRequestData | undefined {
    return undefined;
  }

  exportAsCSV(fields: string[], params?: TableParameters): void {
    console.error(`TableLocalDataSource doesn't support export to CSV`);
  }
}
