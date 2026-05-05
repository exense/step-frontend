import {
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  TrackByFunction,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TablePartSelectionListDirective } from '../../directives/table-part-selection-list.directive';
import { TablePartPaginationDirective } from '../../directives/table-part-pagination.directive';
import { TablePartSortDirective } from '../../directives/table-part-sort.directive';
import { TablePartSearchDirective } from '../../directives/table-part-search.directive';
import { TablePartParamsAndFiltersDirective } from '../../directives/table-part-params-and-filters.directive';
import { TablePartDatasourceDirective } from '../../directives/table-part-datasource.directive';
import { TablePartReloadDirective } from '../../directives/table-part-reload.directive';
import { Observable, of, pairwise, switchMap, tap } from 'rxjs';
import { DatasourceListItemDirective } from '../../directives/datasource-list-item.directive';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TableReload } from '../../services/table-reload';
import { TableSearch, TableSearchParams } from '../../services/table-search';
import { SearchValue } from '../../shared/search-value';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TablePartIndicatorDirective } from '../../directives/table-part-indicator.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgTemplateOutlet } from '@angular/common';
import { EmptyState } from '../../shared/empty-state.enum';

@Component({
  selector: 'step-datasource-list',
  imports: [MatProgressSpinner, NgTemplateOutlet, PaginatorComponent],
  templateUrl: './datasource-list.component.html',
  styleUrl: './datasource-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    TablePartSelectionListDirective,
    {
      directive: TablePartPaginationDirective,
      inputs: ['pageSizeInputDisabled'],
    },
    TablePartSortDirective,
    {
      directive: TablePartSearchDirective,
      inputs: ['defaultSearch'],
    },
    {
      directive: TablePartParamsAndFiltersDirective,
      inputs: ['staticFilters', 'tableParams', 'filter'],
    },
    {
      directive: TablePartDatasourceDirective,
      inputs: ['dataSource', 'calculateCounts'],
    },
    {
      directive: TablePartReloadDirective,
      inputs: ['blockGlobalReload'],
      outputs: ['reloadData'],
    },
    {
      directive: TablePartIndicatorDirective,
      inputs: ['indicatorMode', 'inProgress'],
    },
  ],
})
export class DatasourceListComponent<T> implements TableSearch, TableReload {
  protected readonly _tablePagination = inject(TablePartPaginationDirective);
  protected readonly _tableDataSource = inject<TablePartDatasourceDirective<T>>(TablePartDatasourceDirective);
  protected readonly _tableIndicator = inject(TablePartIndicatorDirective);
  private _tableSearch = inject(TablePartSearchDirective);
  private _tableReload = inject(TablePartReloadDirective);

  readonly trackBy = input<TrackByFunction<T>>((index) => index);
  protected trackByFn: TrackByFunction<T> = (index) => index;
  private effectSyncTrackBy = effect(() => {
    this.trackByFn = this.trackBy();
  });

  private readonly paginator = viewChild(PaginatorComponent);
  private effectPaginatorChange = effect(() => {
    const paginator = this.paginator();
    if (paginator) {
      this._tablePagination.initializePaginator(paginator);
    }
  });

  private effectInitialized = effect(() => {
    this._tableDataSource.initialize(this._tablePagination.paginatorReady());
  });

  private readonly lisItemTemplateDirective = contentChild(DatasourceListItemDirective);
  protected readonly listItemTemplate = computed(() => {
    const listItemTemplateDirective = this.lisItemTemplateDirective();
    return listItemTemplateDirective?._templateRef;
  });

  private readonly dataSource$ = toObservable(this._tableDataSource.tableDataSource);
  private readonly items$ = this.dataSource$.pipe(
    pairwise(),
    tap(([previous]) => previous?.disconnect?.(undefined)),
    switchMap(([, current]) => {
      if (!current) {
        return of([] as T[]);
      }
      return current.connect(undefined);
    }),
  );
  protected readonly items = toSignal(this.items$);
  protected readonly hasItems = computed(() => {
    const items = this.items();
    return !!items?.length;
  });

  getSearchValue$(column: string): Observable<SearchValue | undefined> {
    return this._tableSearch.getSearchValue$(column);
  }

  onSearch(column: string, searchValue: SearchValue, params?: TableSearchParams): void;
  onSearch(column: string, value: string, regex?: boolean, params?: TableSearchParams): void;
  onSearch(
    column: string,
    searchValue: SearchValue | string,
    regexOrParams?: TableSearchParams | boolean,
    params?: TableSearchParams,
  ): void {
    if (typeof searchValue === 'string') {
      this._tableSearch.onSearch(column, searchValue, regexOrParams as boolean, params);
    } else {
      this._tableSearch.onSearch(column, searchValue, regexOrParams as TableSearchParams);
    }
  }

  reload(isCausedByProjectChange?: boolean): void {
    this._tableReload.reload(isCausedByProjectChange);
  }

  protected readonly EmptyState = EmptyState;
}
