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
import { Sort } from '@angular/material/sort';
import { SearchValue } from './search-value';
import { TableRequestData, TableParameters, StepDataSourceReloadOptions } from '../../../client/step-client-module';
import { FilterCondition } from './filter-condition';
import { TableLocalDataSourceConfig } from './table-local-data-source-config';
import { TableLocalDataSourceConfigBuilder } from './table-local-data-source-config-builder';
import { Mutable } from '../../basics/step-basics.module';
import { RequestContainer } from '../types/request-container';
import { StepPageEvent } from '../types/step-page-event';

type Fields =
  | 'data$'
  | 'allData$'
  | 'totalFiltered$'
  | 'forceNavigateToFirstPage$'
  | 'allFiltered$'
  | 'hasNext$'
  | 'inProgress$';
export type TableLocalDataSourceSetupResult = Mutable<Pick<TableLocalDataSource<any>, Fields>>;

interface Request {
  page?: StepPageEvent;
  sort?: Sort;
  search?: { [key: string]: SearchValue };
}

const isSimpleType = (value: any) => ['string', 'number', 'boolean'].includes(typeof value);

export class TableLocalDataSource<T, S extends TableLocalDataSourceSetupResult = TableLocalDataSourceSetupResult>
  implements TableDataSource<T>
{
  static configBuilder<X>(): TableLocalDataSourceConfigBuilder<X> {
    return new TableLocalDataSourceConfigBuilder();
  }

  private _terminator$ = new Subject<void>();
  private _source$!: Observable<T[] | undefined>;

  private _request$ = new BehaviorSubject<RequestContainer<Request>>({});
  private isSharable = false;

  protected fields: S;

  readonly inProgress$!: Observable<boolean>;
  readonly allData$!: Observable<T[]>;
  readonly allFiltered$!: Observable<T[]>;
  readonly data$!: Observable<T[]>;
  readonly hasNext$!: Observable<boolean>;
  readonly totalFiltered$!: Observable<number>;
  readonly forceNavigateToFirstPage$!: Observable<unknown>;

  constructor(
    source: T[] | Observable<T[]>,
    private _config: TableLocalDataSourceConfig<T> = {},
  ) {
    this.fields = this.setupStreams(source, _config);
    this.totalFiltered$ = this.fields.totalFiltered$;
    this.data$ = this.fields.data$;
    this.allFiltered$ = this.fields.allFiltered$;
    this.allData$ = this.fields.allData$;
    this.hasNext$ = this.fields.hasNext$;
    this.inProgress$ = this.fields.inProgress$;
    this.forceNavigateToFirstPage$ = this.fields.forceNavigateToFirstPage$;
  }

  protected setupStreams(
    source: T[] | undefined | Observable<T[] | undefined>,
    config: TableLocalDataSourceConfig<T>,
  ): S {
    const source$ = source instanceof Array || source === undefined ? of(source as T[] | undefined) : source;
    this._source$ = source$.pipe(takeUntil(this._terminator$));

    const requestResult$ = combineLatest([
      this._source$,
      this._request$.pipe(map(({ request }) => request ?? {})),
    ]).pipe(
      map(([src, req]) => {
        let total: number | null = null;
        let totalFiltered = null;

        if ((!req?.page && !req.search && !req.sort) || !src) {
          return {
            total,
            totalFiltered,
            allFiltered: [],
            data: [],
            allData: [],
            hasNext: false,
          };
        }
        total = src.length;

        const allFiltered = this.applySearch(src, req.search);
        totalFiltered = allFiltered.length;

        let data = this.applySort(allFiltered, req.sort);
        data = this.applyPage(data, req.page);

        const hasNext = !this.isLastPage(data, req.page);

        return {
          data,
          allData: src,
          allFiltered,
          total,
          totalFiltered,
          hasNext,
        };
      }),
      shareReplay(1),
    );

    const totalFiltered$ = requestResult$.pipe(map((r) => r.totalFiltered));
    const data$ = requestResult$.pipe(map((r) => r.data));
    const allFiltered$ = requestResult$.pipe(map((r) => r.allFiltered));
    const allData$ = requestResult$.pipe(map((r) => r.allData));
    const hasNext$ = requestResult$.pipe(map((r) => r.hasNext));
    const inProgress$ = of(false);

    const forceNavigateToFirstPage$ = combineLatest([data$, totalFiltered$]).pipe(
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

    return {
      totalFiltered$,
      data$,
      allFiltered$,
      allData$,
      hasNext$,
      inProgress$,
      forceNavigateToFirstPage$,
    } as S;
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

  private applyPage(source: T[], page?: StepPageEvent): T[] {
    if (!page) {
      return [];
    }
    const start = page.pageIndex * page.pageSize;
    const length = page.pageSize;
    return source.slice(start, start + length);
  }

  private isLastPage(source: T[], page?: StepPageEvent): boolean {
    if (!page) {
      return true;
    }
    const start = page.pageIndex * page.pageSize;
    const length = page.pageSize;
    const approximateEnd = start + length;
    return approximateEnd >= source.length;
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
