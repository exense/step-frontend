import { TableDataSource, TableFilterOptions, TableGetDataOptions } from './table-data-source';
import { CollectionViewer } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  timer,
} from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { SearchValue } from './search-value';
import { TableRequestData, TableParameters, StepDataSourceReloadOptions } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { TableLocalDataSourceConfig } from './table-local-data-source-config';
import { TableLocalDataSourceConfigBuilder } from './table-local-data-source-config-builder';
import { Mutable } from '../../basics/step-basics.module';
import { RequestContainer } from '../types/request-container';

type FieldAccessor = Mutable<
  Pick<
    TableLocalDataSource<any>,
    'data$' | 'allData$' | 'totalFiltered$' | 'forceNavigateToFirstPage$' | 'allFiltered$'
  >
>;

interface Request {
  page?: PageEvent;
  sort?: Sort;
  search?: { [key: string]: SearchValue };
}

const isSimpleType = (value: any) => ['string', 'number', 'boolean'].includes(typeof value);

export class TableLocalDataSource<T> implements TableDataSource<T> {
  static configBuilder<X>(): TableLocalDataSourceConfigBuilder<X> {
    return new TableLocalDataSourceConfigBuilder();
  }

  private _terminator$ = new Subject<void>();
  private _source$!: Observable<T[] | undefined>;

  private _request$ = new BehaviorSubject<RequestContainer<Request>>({});
  private isSharable = false;

  readonly inProgress$: Observable<boolean> = of(false);

  readonly allData$!: Observable<T[]>;
  readonly allFiltered$!: Observable<T[]>;
  readonly data$!: Observable<T[]>;
  readonly totalFiltered$!: Observable<number>;
  readonly forceNavigateToFirstPage$!: Observable<unknown>;

  constructor(
    source: T[] | Observable<T[]>,
    private _config: TableLocalDataSourceConfig<T> = {},
  ) {
    this.setupStreams(source, _config);
  }

  protected setupStreams(
    source: T[] | undefined | Observable<T[] | undefined>,
    config: TableLocalDataSourceConfig<T>,
  ): void {
    const source$ = source instanceof Array || source === undefined ? of(source as T[] | undefined) : source;
    this._source$ = source$.pipe(takeUntil(this._terminator$));

    const requestResult$ = combineLatest([
      this._source$,
      this._request$.pipe(map(({ request }) => request ?? {})),
    ]).pipe(
      map(([src, req]) => {
        let total: number | null = null;
        let totalFiltered = 0;

        if ((!req?.page && !req.search && !req.sort) || !src) {
          return {
            total,
            totalFiltered,
            allFiltered: [],
            data: [],
            allData: [],
          };
        }
        total = src.length;

        const allFiltered = this.applySearch(src, req.search);
        totalFiltered = allFiltered.length;

        let data = this.applySort(allFiltered, req.sort);
        data = this.applyPage(data, req.page);

        return {
          data,
          allData: src,
          allFiltered,
          total,
          totalFiltered,
        };
      }),
      shareReplay(1),
    );

    const self = this as FieldAccessor;
    self.totalFiltered$ = requestResult$.pipe(map((r) => r.totalFiltered));
    self.data$ = requestResult$.pipe(map((r) => r.data));
    self.allFiltered$ = requestResult$.pipe(map((r) => r.allFiltered));
    self.allData$ = requestResult$.pipe(map((r) => r.allData));

    self.forceNavigateToFirstPage$ = combineLatest([this.data$, this.totalFiltered$]).pipe(
      map(([data, totalFiltered]) => {
        const recordsInPage = (data || []).length;
        const recordsFiltered = totalFiltered || 0;
        return recordsFiltered > 0 && recordsInPage === 0;
      }),
      filter((forceNavigate) => forceNavigate === true),
      // Little time gap is required for local data source, to make sure that all previous data is rendered.
      // Otherwise, navigating to the first page may happen and data will be valid
      // but sum previous data maybe rendered
      switchMap(() => timer(100)),
    );
  }

  private getItemValue(item: T, field: string): string {
    if (!item) {
      return '';
    }
    const valueContainer = item as any;
    if (valueContainer[field]) {
      return valueContainer[field].toString();
    }
    const parts = field.split('.');
    const result = parts.reduce((container, part) => container?.[part], valueContainer);
    return result ? result.toString() : '';
  }

  private applySearch(source: T[], search?: { [key: string]: SearchValue }): T[] {
    if (!search || Object.keys(search).length === 0) {
      return source;
    }

    const predicates = Object.entries(search)
      .map(([column, value]) => {
        // ignore complicated remote filters fol local data sources
        if (!value || value instanceof FilterCondition) {
          return undefined;
        }

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
            const itemValue = isSimpleType(item) ? ((item as any) || '').toString() : this.getItemValue(item, column);

            return itemValue.trim().toLowerCase().includes(searchValue!);
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
      const colValueA = isSimpleType(itemA) ? ((itemA as any) || '').toString() : this.getItemValue(itemA, sortBy);

      const colValueB = isSimpleType(itemB) ? ((itemB as any) || '').toString() : this.getItemValue(itemB, sortBy);

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
    if (!this.isSharable) {
      this.destroy();
    }
  }

  sharable(): this {
    this.isSharable = true;
    return this;
  }

  destroy(): void {
    this._terminator$.next();
    this._terminator$.complete();
    this._request$.complete();
  }

  getTableData(options?: TableGetDataOptions): void {
    const request = { ...(this._request$.value.request ?? {}) };
    request.page = options?.page || request.page;
    request.sort = options?.sort || request.sort;
    request.search = options?.search || request.search;
    this._request$.next({ request, isForce: true });
  }

  reload(reloadOptions?: StepDataSourceReloadOptions): void {
    const value = { ...(this._request$.value ?? {}) };
    value.hideProgress = reloadOptions?.hideProgress;
    value.immediateHideProgress = reloadOptions?.immediateHideProgress;
    value.isForce = reloadOptions?.isForce;
    this._request$.next(value);
  }

  getFilterRequest(options?: TableFilterOptions): TableRequestData | undefined {
    return undefined;
  }

  exportAsCSV(fields: string[], params?: TableParameters): void {
    console.error(`TableLocalDataSource doesn't support export to CSV`);
  }

  skipOngoingRequest(): void {
    console.error(`TableLocalDataSource doesn't support skipping requests`);
  }
}
