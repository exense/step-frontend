/* eslint-disable */
import {
  AfterViewInit,
  Component,
  computed,
  contentChild,
  contentChildren,
  ContentChildren,
  DestroyRef,
  effect,
  EventEmitter,
  forwardRef,
  inject,
  input,
  Input,
  linkedSignal,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  signal,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
  untracked,
  viewChild,
  ViewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, map, Observable, Subject, takeUntil, timestamp } from 'rxjs';
import { TableDataSource } from '../../shared/table-data-source';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';
import { TableRemoteDataSource } from '../../shared/table-remote-data-source';
import { TableLocalDataSource } from '../../shared/table-local-data-source';
import { SearchValue } from '../../shared/search-value';
import { ColumnDirective } from '../../directives/column.directive';
import { StepDataSource, TableParameters, TableRequestData } from '../../../../client/step-client-module';
import { AdditionalHeaderDirective } from '../../directives/additional-header.directive';
import { TableFilter } from '../../services/table-filter';
import { TableReload } from '../../services/table-reload';
import { SearchColumn } from '../../shared/search-column.interface';
import { TablePersistenceStateService } from '../../services/table-persistence-state.service';
import { TableHighlightItemContainer } from '../../services/table-highlight-item-container.service';
import { TablePersistenceUrlStateService } from '../../services/table-persistence-url-state.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';
import { CustomColumnsComponent } from '../custom-columns/custom-columns.component';
import { TableColumnsService } from '../../services/table-columns.service';
import { TableColumnsDefinitionService } from '../../services/table-columns-definition.service';
import { TableColumnsDictionaryService } from '../../services/table-columns-dictionary.service';
import { ColumnInfo } from '../../types/column-info';
import { GlobalReloadService } from '../../../basics/step-basics.module';
import { RowsExtensionDirective } from '../../directives/rows-extension.directive';
import { RowDirective } from '../../directives/row.directive';
import { TableIndicatorMode } from '../../types/table-indicator-mode.enum';
import { ColumnsPlaceholdersComponent } from '../columns-placeholders/columns-placeholders.component';
import { TablePaginatorPrefixDirective } from '../../directives/table-paginator-prefix.directive';
import { TablePaginatorContentDirective } from '../../directives/table-paginator-content.directive';
import { TablePartSelectionListDirective } from '../../directives/table-part-selection-list.directive';
import { TablePartPaginationDirective } from '../../directives/table-part-pagination.directive';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TablePartSortDirective } from '../../directives/table-part-sort.directive';
import { TablePartSearchDirective } from '../../directives/table-part-search.directive';
import { TableSearch, TableSearchParams } from '../../services/table-search';

export type DataSource<T> = StepDataSource<T> | TableDataSource<T> | T[] | Observable<T[]>;

enum EmptyState {
  INITIAL,
  NO_MATCHING_RECORDS,
}

@Component({
  selector: 'step-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.in-progress]': 'applyInProgressClass()',
    '[class.use-skeleton-placeholder]': 'useSkeletonPlaceholder()',
  },
  hostDirectives: [
    TablePartSelectionListDirective,
    TablePartPaginationDirective,
    TablePartSortDirective,
    {
      directive: TablePartSearchDirective,
      inputs: ['defaultSearch'],
    },
  ],
  providers: [
    {
      provide: TableFilter,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: TableReload,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: TableHighlightItemContainer,
      useExisting: forwardRef(() => TableComponent),
    },
    TablePersistenceUrlStateService,
    {
      provide: TablePersistenceStateService,
      useFactory: () => {
        const urlState = inject(TablePersistenceUrlStateService, { self: true });
        const externalDefinedState = inject(TablePersistenceStateService, { skipSelf: true, optional: true });
        const result = externalDefinedState ?? urlState;
        result.initialize();
        return result;
      },
    },
    {
      provide: TableColumnsDictionaryService,
      useExisting: forwardRef(() => TableComponent),
    },
    TableColumnsDefinitionService,
    TableCustomColumnsService,
    TableColumnsService,
  ],
  standalone: false,
})
export class TableComponent<T>
  implements
    AfterViewInit,
    OnChanges,
    OnDestroy,
    TableSearch,
    TableFilter,
    TableReload,
    TableHighlightItemContainer,
    TableColumnsDictionaryService
{
  private _globalReloadService = inject(GlobalReloadService);
  private _tableState = inject(TablePersistenceStateService);
  private _destroyRef = inject(DestroyRef);
  private _columnsDefinitions = inject(TableColumnsDefinitionService);
  readonly _tableColumns = inject(TableColumnsService);

  private _tableSelection = inject(TablePartSelectionListDirective);
  protected readonly _tablePagination = inject(TablePartPaginationDirective);
  private _tableSort = inject(TablePartSortDirective);
  private _tableSearch = inject(TablePartSearchDirective);

  private readonly paginator = viewChild(PaginatorComponent);
  private effectPaginatorChange = effect(() => {
    const paginator = this.paginator();
    if (paginator) {
      this._tablePagination.initializePaginator(paginator);
    }
  });

  private initRequired: boolean = false;
  private hasCustom: boolean = false;
  private isInitialized: boolean = false;

  protected searchColumns: SearchColumn[] = [];

  private dataSourceTerminator$?: Subject<void>;

  @Output() onReload = new EventEmitter<unknown>();
  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: DataSource<T>;
  readonly staticFilters = input<Record<string, SearchValue> | undefined>();
  private staticFilters$ = toObservable(this.staticFilters);

  private usedColumns = new Set<string>();

  readonly indicatorMode = input<TableIndicatorMode>(TableIndicatorMode.SKELETON);

  readonly inProgressExternal = input(false, { alias: 'inProgress' });
  private inProgressDataSource = signal(false);
  protected readonly hasNext = signal(false);
  protected readonly totalFiltered = signal<number | null>(null);
  private isTableReadyToRenderColumns = signal(false);

  protected readonly EmptyState = EmptyState;
  protected readonly emptyState = computed(() => {
    const totalFiltered = this.totalFiltered();
    const isColumnsInitialized = this._tableColumns.isInitialized();
    if (totalFiltered === null || !isColumnsInitialized) {
      return EmptyState.INITIAL;
    }

    return EmptyState.NO_MATCHING_RECORDS;
  });

  protected readonly useSkeletonPlaceholder = linkedSignal(() => {
    const indicatorMode = this.indicatorMode();
    return indicatorMode == TableIndicatorMode.SKELETON_ON_INITIAL_LOAD || indicatorMode == TableIndicatorMode.SKELETON;
  });

  protected readonly useSpinner = computed(() => {
    const indicatorMode = this.indicatorMode();
    return indicatorMode === TableIndicatorMode.SPINNER;
  });

  private effectResetSkeletonPlaceholderOnInitialLoad = effect(() => {
    const indicatorMode = this.indicatorMode();
    const emptyState = this.emptyState();
    if (indicatorMode == TableIndicatorMode.SKELETON_ON_INITIAL_LOAD && emptyState !== EmptyState.INITIAL) {
      setTimeout(() => {
        this.useSkeletonPlaceholder.set(false);
      }, 500);
    }
  });

  protected readonly inProgress = computed(() => {
    const inProgressExternal = this.inProgressExternal();
    const inProgressDataSource = this.inProgressDataSource();
    return inProgressExternal || inProgressDataSource;
  });

  protected readonly applyInProgressClass = computed(() => {
    const inProgress = this.inProgress();
    const emptyState = this.emptyState();
    return inProgress || emptyState === EmptyState.INITIAL;
  });

  protected tableDataSource?: TableDataSource<T>;

  readonly pageSizeInputDisabled = input(false);

  readonly visibleColumns = input(undefined, {
    transform: (source?: string[]) => (!!source ? new Set<string>(source) : undefined),
  });

  readonly filter = input<string | undefined>(undefined);

  readonly tableParams = input<TableParameters | undefined>(undefined);

  readonly noResultsPlaceholder = input<string | undefined>(undefined);

  readonly blockGlobalReload = input(false);

  readonly calculateCounts = input(true);
  private calculateCounts$ = toObservable(this.calculateCounts);

  private effectSetupGlobalReload = effect(() => {
    const isGlobalBlocked = this.blockGlobalReload();
    if (isGlobalBlocked) {
      this._globalReloadService.unRegister(this);
    } else {
      this._globalReloadService.register(this);
    }
  });

  @ViewChild(MatTable) private table?: MatTable<any>;

  @ContentChildren(AdditionalHeaderDirective) additionalHeaders?: QueryList<AdditionalHeaderDirective>;
  additionalHeaderGroups?: Array<Array<AdditionalHeaderDirective>>;

  /** @ViewChildren **/
  private rows = viewChildren(RowDirective);

  protected readonly rowInfos = computed(() => {
    const rows = this.rows();
    const result = (rows ?? []).map((row) => row.getRowInfo()).filter((row) => !!row.data);
    if (!result.length) {
      return undefined;
    }
    return result;
  });

  protected readonly rowsExtension = contentChild(RowsExtensionDirective);
  protected readonly tablePaginatorPrefix = contentChild(TablePaginatorPrefixDirective);
  protected readonly tablePaginatorContent = contentChild(TablePaginatorContentDirective);

  private contentColumns = contentChildren(ColumnDirective);

  private viewColumns = viewChildren(ColumnDirective);

  private columnsPlaceholder = viewChild(ColumnsPlaceholdersComponent);
  private columnsPlaceholderIds = computed(() => {
    const cols = this.columnsPlaceholder()?.colDef?.() ?? [];
    return cols.map((col) => col.name);
  });

  private columnsUpdateTrigger = signal(0);

  private columns = computed(() => {
    const updateTrigger = this.columnsUpdateTrigger();
    return [...this.contentColumns(), ...this.viewColumns()];
  });

  readonly columnsDictionary = computed(() => {
    const alreadyUsed = new Set<string>();
    return (this.columns() ?? []).reduce((res, column) => {
      const infos: ColumnInfo[] = [];
      for (let info of column.columnInfos) {
        if (!alreadyUsed.has(info.columnId)) {
          infos.push(info);
          alreadyUsed.add(info.columnId);
        }
      }

      return res.concat(infos);
    }, [] as ColumnInfo[]);
  });

  private allCollDef = computed(() => {
    const alreadyUsed = new Set<string>();
    return (this.columns() ?? []).reduce((res, col) => {
      const definitions: MatColumnDef[] = [];
      for (let def of col.columnDefinitions) {
        if (!alreadyUsed.has(def.name)) {
          definitions.push(def);
          alreadyUsed.add(def.name);
        }
      }

      return res.concat(definitions);
    }, [] as MatColumnDef[]);
  });

  private allSearchColDef = computed(() => {
    return (this.columns() ?? [])
      .reduce((res, col) => [...res, ...col.searchColumnDefinitions], [] as SearchColDirective[])
      .filter((x) => !x.isSearchDisabled);
  });

  private customRemoteColumns = viewChild(CustomColumnsComponent);

  readonly displayColumns = computed(() => {
    const isColumnsInitialized = this._tableColumns.isInitialized();
    const columnPlaceholderIds = untracked(() => this.columnsPlaceholderIds());
    const isTableReady = this.isTableReadyToRenderColumns();
    const visibleColumnsByConfig = this._tableColumns.visibleColumns();
    const visibleColumnsByInput = this.visibleColumns();

    if (!isColumnsInitialized) {
      return isTableReady ? columnPlaceholderIds : [];
    }

    if (!visibleColumnsByInput) {
      return visibleColumnsByConfig;
    }
    return visibleColumnsByConfig.filter((col) => visibleColumnsByInput.has(col));
  });

  readonly displaySearchColumns = computed(() => {
    const searchColumnNames = this.displayColumns().map((col) => `search-${col}`);
    const configuredSearchColumnNames = new Set(this.searchColumns.map((col) => col.colName));
    return searchColumnNames.filter((col) => configuredSearchColumnNames.has(col));
  });

  protected handleColumnsChange(): void {
    this.columnsUpdateTrigger.update((value) => (value + 1) % 10);
    setTimeout(() => {
      if (!this.isInitialized) {
        return;
      }
      this.configureColumns();
      this.configureSearchColumns();
      this.addCustomColumnsDefinitionsToRemoteDatasource();
    });
  }

  private filter$ = toObservable(this.filter);
  private tableParams$ = toObservable(this.tableParams);

  highlightedItem?: unknown;

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

  private addCustomColumnsDefinitionsToRemoteDatasource(): void {
    if (this.dataSource instanceof TableRemoteDataSource && this.hasCustom) {
      this.columns()!
        .reduce((res, col) => {
          if (!col.isCustom) {
            return res;
          }
          const names = col.columnDefinitions.map((x) => x.name);
          return [...res, ...names];
        }, [] as string[])
        .forEach((name) => {
          (this.dataSource as TableRemoteDataSource<T>).setColumnMap(name, name);
        });
    }
  }

  /**
   * initialize array of distinct headerGroups
   */
  private setupAdditionalsHeaderGroups(): void {
    if (!this.additionalHeaders) {
      return;
    }
    this.additionalHeaders
      .filter((header) => !header.headerGroupId)
      .forEach((header, i) => (header.headerGroupId = `non-grouped-header-${i + 1}`));

    const headerGroupIdToHeaders = this.additionalHeaders.reduce(
      (result, additionalHeader) => {
        const id = additionalHeader.headerGroupId!;
        const headerGroup = (result[id] = result[id] || []);
        headerGroup.push(additionalHeader);
        return result;
      },
      {} as Record<string, AdditionalHeaderDirective[]>,
    );

    this.additionalHeaderGroups = Object.values(headerGroupIdToHeaders);
  }

  getTableFilterRequest(): TableRequestData | undefined {
    const [search, filter, params] = [this._tableSearch.search.search, this.filter(), this.tableParams()];
    return this.tableDataSource?.getFilterRequest({ search, filter, params });
  }

  reload(isCausedByProjectChange?: boolean): void {
    this.onReload.emit({});
    this.tableDataSource?.reload();
    if (isCausedByProjectChange) {
      this._tablePagination.resetToFirstPage();
    }
  }

  ngAfterViewInit(): void {
    const setup = () => {
      this.setupAdditionalsHeaderGroups();
      this.configureColumns();
      this.configureSearchColumns();
      this._columnsDefinitions.setup(this.contentColumns, this.customRemoteColumns);
      this._tableColumns.initialize();

      if (this.initRequired) {
        this.setupDatasource(this.dataSource);
      }

      this.addCustomColumnsDefinitionsToRemoteDatasource();
      this.isInitialized = true;
    };

    const customCols = this.columns()?.filter((col) => col.isCustom) || [];

    if (!customCols?.length) {
      // Invoke setup in next CD cycle to prevent
      // ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => setup());
    } else {
      this.hasCustom = true;
      const ready$ = combineLatest(customCols.map((col) => col.ready$));
      ready$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(setup);
    }
  }

  ngOnDestroy(): void {
    this.terminateDatasource();
    this._globalReloadService.unRegister(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cDatasource = changes['dataSource'];
    if (cDatasource?.previousValue !== cDatasource?.currentValue) {
      this.setupDatasource(cDatasource.currentValue);
    }
  }

  private configureColumns(): void {
    const columnsPlaceholder = this.columnsPlaceholder()?.colDef?.() ?? [];
    columnsPlaceholder.forEach((col) => {
      if (!this.usedColumns.has(col.name)) {
        this.usedColumns.add(col.name);
        this.table!.addColumnDef(col);
      }
    });

    const allCollDef = this.allCollDef();
    allCollDef.forEach((col) => {
      if (!this.usedColumns.has(col.name) && !col.name.startsWith('search-')) {
        this.usedColumns.add(col.name);
        this.table!.addColumnDef(col);
      }
    });
    this.isTableReadyToRenderColumns.set(true);
  }

  private configureSearchColumns(): void {
    const searchColDef = this.allSearchColDef();

    if (!searchColDef?.length) {
      this.searchColumns = [];
      return;
    }

    const searchColumns = searchColDef.reduce((res, x) => {
      const searchName = x.searchColumnName;
      const template = x?.searchCell?.template;
      res.set(searchName, { searchName, template });
      return res;
    }, new Map<string, { searchName?: string; template?: TemplateRef<any> }>());

    this.searchColumns = this.allCollDef().map((col) => {
      const colName = `search-${col.name}`;
      const { searchName, template } = searchColumns.get(col.name) ?? {};
      return { colName, searchName, template };
    });
  }

  exportAsCSV(fields: string[]): void {
    if (!this.tableDataSource) {
      console.error('No datasource for export');
      return;
    }
    this.tableDataSource.exportAsCSV(fields, this.tableParams());
  }

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
}
