import { Directive, inject, input } from '@angular/core';
import { combineLatest, map, Observable, Subject, takeUntil, timestamp } from 'rxjs';
import { TableDataSource } from '../shared/table-data-source';
import { TableRemoteDataSource } from '../shared/table-remote-data-source';
import { TableLocalDataSource } from '../shared/table-local-data-source';
import { SearchValue } from '../shared/search-value';
import { DataSource } from '@angular/cdk/collections';
import { TablePartSelectionListDirective } from './table-part-selection-list.directive';
import { TablePartPaginationDirective } from './table-part-pagination.directive';
import { TablePartSortDirective } from './table-part-sort.directive';
import { TablePartSearchDirective } from './table-part-search.directive';
import { TableParameters, TablePersistenceStateService } from '@exense/step-core';
import { toObservable } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[stepTablePartDatasource]',
  hostDirectives: [
    TablePartSelectionListDirective,
    TablePartPaginationDirective,
    TablePartSortDirective,
    {
      directive: TablePartSearchDirective,
      inputs: ['defaultSearch'],
    },
  ],
})
export class TablePartDatasourceDirective<T> {
  private _tableState = inject(TablePersistenceStateService);
  private _tableSelection = inject(TablePartSelectionListDirective);
  protected readonly _tablePagination = inject(TablePartPaginationDirective);
  private _tableSort = inject(TablePartSortDirective);
  private _tableSearch = inject(TablePartSearchDirective);

  readonly staticFilters = input<Record<string, SearchValue> | undefined>();
  private staticFilters$ = toObservable(this.staticFilters);

  readonly filter = input<string | undefined>(undefined);
  private filter$ = toObservable(this.filter);

  readonly tableParams = input<TableParameters | undefined>(undefined);
  private tableParams$ = toObservable(this.tableParams);

  readonly calculateCounts = input(true);
  private calculateCounts$ = toObservable(this.calculateCounts);

  private dataSourceTerminator$ = new Subject<void>();

  private terminateDatasource(): void {
    this.dataSourceTerminator$?.next();
    this.dataSourceTerminator$?.complete();
    this.dataSourceTerminator$ = undefined;
    this.inProgressDataSource.set(false);
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

    this.tableDataSource = tableDataSource;
    this._tableSelection.prepareSelectionList(tableDataSource);

    if (!this._tablePagination.isPaginatorReady) {
      this.initRequired = true;
      return;
    }

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

    combineLatest([pageAndSearch$, sort$, this.filter$, this.tableParams$, this.staticFilters$, this.calculateCounts$])
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
      this.inProgressDataSource.set(inProgress);
    });

    tableDataSource!.totalFiltered$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe((total) => {
      this.totalFiltered.set(total);
    });

    tableDataSource!.hasNext$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe((hasNext) => {
      this.hasNext.set(hasNext);
    });
  }
}
