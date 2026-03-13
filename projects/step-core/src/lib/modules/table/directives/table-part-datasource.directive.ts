import { Directive, effect, forwardRef, inject, input, OnDestroy, output, signal, untracked } from '@angular/core';
import { combineLatest, map, Observable, Subject, takeUntil, timestamp } from 'rxjs';
import { TablePartSelectionListDirective } from './table-part-selection-list.directive';
import { TablePartPaginationDirective } from './table-part-pagination.directive';
import { TablePartSortDirective } from './table-part-sort.directive';
import { TablePartSearchDirective } from './table-part-search.directive';
import { TablePartParamsAndFiltersDirective } from './table-part-params-and-filters.directive';
import { toObservable } from '@angular/core/rxjs-interop';
import { TablePersistenceUrlStateService } from '../services/table-persistence-url-state.service';
import { TablePersistenceStateService } from '../services/table-persistence-state.service';
import { TableDataSource } from '../shared/table-data-source';
import { TableRemoteDataSource } from '../shared/table-remote-data-source';
import { TableLocalDataSource } from '../shared/table-local-data-source';
import { StepDataSource, TableRequestData } from '../../../client/step-client-module';
import { SearchValue } from '../shared/search-value';
import { TableFilter } from '../services/table-filter';

export type DataSource<T> = StepDataSource<T> | TableDataSource<T> | T[] | Observable<T[]>;

@Directive({
  selector: '[stepTablePartDatasource]',
  providers: [
    TablePersistenceUrlStateService,
    {
      provide: TablePersistenceStateService,
      useFactory: () => {
        const _urlState = inject(TablePersistenceUrlStateService, { self: true });
        const _externalDefinedState = inject(TablePersistenceStateService, { skipSelf: true, optional: true });
        const result = _externalDefinedState ?? _urlState;
        result.initialize();
        return result;
      },
    },
    {
      provide: TableFilter,
      useExisting: forwardRef(() => TablePartDatasourceDirective),
    },
  ],
})
export class TablePartDatasourceDirective<T> implements OnDestroy, TableFilter {
  private _tableState = inject(TablePersistenceStateService);
  private _tableSelection = inject(TablePartSelectionListDirective);
  protected readonly _tablePagination = inject(TablePartPaginationDirective);
  private _tableSort = inject(TablePartSortDirective);
  private _tableSearch = inject(TablePartSearchDirective);
  private _tableParams = inject(TablePartParamsAndFiltersDirective);

  private dataSourceTerminator$?: Subject<void>;

  private readonly inProgressDataSourceInternal = signal(false);
  private readonly hasNextInternal = signal(false);
  private readonly totalFilteredInternal = signal<number | null>(null);
  private readonly tableDataSourceInternal = signal<TableDataSource<T> | undefined>(undefined);

  readonly inProgressDataSource = this.inProgressDataSourceInternal.asReadonly();
  readonly hasNext = this.hasNextInternal.asReadonly();
  readonly totalFiltered = this.totalFilteredInternal.asReadonly();
  readonly tableDataSource = this.tableDataSourceInternal.asReadonly();

  readonly calculateCounts = input(true);
  private calculateCounts$ = toObservable(this.calculateCounts);

  readonly dataSource = input<DataSource<T> | undefined>(undefined);
  private effectDataSourceChange = effect(() => {
    const dataSource = this.dataSource();
    const isPaginatorReady = this._tablePagination.paginatorReady();
    if (isPaginatorReady) {
      untracked(() => this.setupDatasource(dataSource));
    }
  });

  ngOnDestroy(): void {
    this.terminateDatasource();
  }

  private terminateDatasource(): void {
    this.dataSourceTerminator$?.next();
    this.dataSourceTerminator$?.complete();
    this.dataSourceTerminator$ = undefined;
    this.inProgressDataSourceInternal.set(false);
    this._tableSelection.destroySelectionList();
  }

  private setupDatasource(dataSource?: DataSource<T>): void {
    this.terminateDatasource();
    this.dataSourceTerminator$ = new Subject<void>();

    if (!dataSource) {
      return;
    }

    let tableDataSource: TableDataSource<T>;

    if (dataSource instanceof TableRemoteDataSource || dataSource instanceof TableLocalDataSource) {
      tableDataSource = dataSource;
    } else {
      tableDataSource = new TableLocalDataSource(dataSource as T[] | Observable<T[]>);
    }

    this.tableDataSourceInternal.set(tableDataSource);
    this._tableSelection.prepareSelectionList(tableDataSource);

    const sort$ = this._tableSort.setupSortStream();
    const page$ = this._tablePagination.setupPageStream();
    const search$ = this._tableSearch.search$;

    const pageAndSearch$ = combineLatest({
      pageWithTimeStamp: page$.pipe(timestamp()),
      searchWithTimeStamp: search$.pipe(timestamp()),
    }).pipe(
      map(({ pageWithTimeStamp, searchWithTimeStamp }) => {
        const { search, resetPagination, isForce, hideProgress, immediateHideProgress } = searchWithTimeStamp.value;
        let page = pageWithTimeStamp.value;
        // Change has been triggered, by search. In that case reset page to first one
        const isRestToFirstPage = searchWithTimeStamp.timestamp > pageWithTimeStamp.timestamp;
        if (resetPagination && isRestToFirstPage) {
          page = this._tablePagination.resetToFirstPage();
        }
        return { page, search, isForce, hideProgress, immediateHideProgress };
      }),
    );

    combineLatest([
      pageAndSearch$,
      sort$,
      this._tableParams.filter$,
      this._tableParams.tableParams$,
      this._tableParams.staticFilters$,
      this.calculateCounts$,
    ])
      .pipe(takeUntil(this.dataSourceTerminator$))
      .subscribe(
        ([
          { page, search, isForce, hideProgress, immediateHideProgress },
          sort,
          filter,
          params,
          staticFilters,
          calculateCounts,
        ]) => {
          this._tableState.saveState(search, page, sort);
          const mergedSearch: Record<string, SearchValue> = { ...search, ...staticFilters };
          tableDataSource.getTableData({
            page,
            sort,
            isForce,
            hideProgress,
            immediateHideProgress,
            search: mergedSearch,
            filter,
            params,
            calculateCounts,
          });
        },
      );

    tableDataSource!.forceNavigateToFirstPage$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe(() => {
      this._tablePagination.resetToFirstPage();
    });

    tableDataSource!.inProgress$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe((inProgress) => {
      this.inProgressDataSourceInternal.set(inProgress);
    });

    tableDataSource!.totalFiltered$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe((total) => {
      this.totalFilteredInternal.set(total);
    });

    tableDataSource!.hasNext$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe((hasNext) => {
      this.hasNextInternal.set(hasNext);
    });
  }

  getTableFilterRequest(): TableRequestData | undefined {
    const [search, filter, params] = [
      this._tableSearch.search.search,
      untracked(() => this._tableParams.filter()),
      untracked(() => this._tableParams.tableParams()),
    ];
    return untracked(() => this.tableDataSource())?.getFilterRequest({ search, filter, params });
  }

  exportAsCSV(fields: string[]): void {
    const tableDataSource = untracked(() => this.tableDataSource());
    if (!tableDataSource) {
      console.error('No datasource for export');
      return;
    }
    const params = untracked(() => this._tableParams.tableParams());
    tableDataSource.exportAsCSV(fields, params);
  }
}
