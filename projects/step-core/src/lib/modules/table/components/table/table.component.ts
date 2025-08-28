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
  Injector,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  runInInjectionContext,
  signal,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
  viewChild,
  ViewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  timestamp,
} from 'rxjs';
import { TableDataSource } from '../../shared/table-data-source';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { SearchColDirective } from '../../directives/search-col.directive';
import { TableRemoteDataSource } from '../../shared/table-remote-data-source';
import { TableLocalDataSource } from '../../shared/table-local-data-source';
import { TableSearch } from '../../services/table-search';
import { SearchValue } from '../../shared/search-value';
import { ColumnDirective } from '../../directives/column.directive';
import { TableRequestData, TableParameters, StepDataSource } from '../../../../client/step-client-module';
import { AdditionalHeaderDirective } from '../../directives/additional-header.directive';
import { TableFilter } from '../../services/table-filter';
import { TableReload } from '../../services/table-reload';
import { ItemsPerPageDefaultService } from '../../services/items-per-page-default.service';
import { HasFilter } from '../../../entities-selection/injectables/has-filter';
import { FilterCondition } from '../../shared/filter-condition';
import { SearchColumn } from '../../shared/search-column.interface';
import { TablePersistenceStateService } from '../../services/table-persistence-state.service';
import { TableHighlightItemContainer } from '../../services/table-highlight-item-container.service';
import { TablePersistenceUrlStateService } from '../../services/table-persistence-url-state.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';
import { PaginatorComponent } from '../paginator/paginator.component';
import { CustomColumnsComponent } from '../custom-columns/custom-columns.component';
import { TableColumnsService } from '../../services/table-columns.service';
import { TableColumnsDefinitionService } from '../../services/table-columns-definition.service';
import { TableColumnsDictionaryService } from '../../services/table-columns-dictionary.service';
import { ColumnInfo } from '../../types/column-info';
import { GlobalReloadService, isValidRegex } from '../../../basics/step-basics.module';
import { ItemsPerPageService } from '../../services/items-per-page.service';
import { RowsExtensionDirective } from '../../directives/rows-extension.directive';
import { RowDirective } from '../../directives/row.directive';
import { EntitySelectionStateUpdatable, SelectionList } from '../../../entities-selection';
import { TableSelectionList } from '../../shared/selection/table-selection-list';
import { TableRemoteSelectionList } from '../../shared/selection/table-remote-selection-list';
import { TableLocalSelectionList } from '../../shared/selection/table-local-selection-list';

export type DataSource<T> = StepDataSource<T> | TableDataSource<T> | T[] | Observable<T[]>;

interface SearchData {
  search: Record<string, SearchValue>;
  resetPagination: boolean;
}

@Component({
  selector: 'step-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.in-progress]': 'inProgress()',
    '[class.use-skeleton-placeholder]': 'useSkeletonPlaceholder()',
  },
  providers: [
    {
      provide: TableSearch,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: TableFilter,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: TableReload,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: HasFilter,
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
    {
      provide: SelectionList,
      useExisting: forwardRef(() => TableComponent),
    },
  ],
  standalone: false,
})
export class TableComponent<T>
  implements
    OnInit,
    AfterViewInit,
    OnChanges,
    OnDestroy,
    TableSearch,
    TableFilter,
    TableReload,
    HasFilter,
    TableHighlightItemContainer,
    TableColumnsDictionaryService,
    SelectionList<unknown, T>
{
  private _globalReloadService = inject(GlobalReloadService);
  private _tableState = inject(TablePersistenceStateService);
  private _sort = inject(MatSort, { optional: true });
  private _destroyRef = inject(DestroyRef);
  private _columnsDefinitions = inject(TableColumnsDefinitionService);
  readonly _tableColumns = inject(TableColumnsService);
  private _selectionState = inject(EntitySelectionStateUpdatable, { optional: true });
  private _injector = inject(Injector);

  private initRequired: boolean = false;
  private hasCustom: boolean = false;
  private isInitialized: boolean = false;

  protected searchColumns: SearchColumn[] = [];

  private dataSourceTerminator$?: Subject<void>;

  @Output() onReload = new EventEmitter<unknown>();
  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: DataSource<T>;
  staticFilters = input<Record<string, SearchValue> | undefined>();
  staticFilters$ = toObservable(this.staticFilters);

  private usedColumns = new Set<string>();

  readonly useSkeletonPlaceholder = input(false);

  readonly inProgressExternal = input(false, { alias: 'inProgress' });
  private inProgressDataSource = signal(false);

  protected readonly inProgress = computed(() => {
    const inProgressExternal = this.inProgressExternal();
    const inProgressDataSource = this.inProgressDataSource();
    return inProgressExternal || inProgressDataSource;
  });

  protected tableDataSource?: TableDataSource<T>;
  private tableSelectionList?: TableSelectionList<T, TableDataSource<T>>;

  readonly pageSizeInputDisabled = input(false);

  readonly visibleColumns = input(undefined, {
    transform: (source?: string[]) => (!!source ? new Set<string>(source) : undefined),
  });

  @Input() defaultSearch?: Record<string, SearchValue>;

  readonly filter = input<string | undefined>(undefined);

  readonly tableParams = input<TableParameters | undefined>(undefined);

  readonly noResultsPlaceholder = input<string | undefined>(undefined);

  readonly blockGlobalReload = input(false);

  private effectSetupGlobalReload = effect(() => {
    const isGlobalBlocked = this.blockGlobalReload();
    if (isGlobalBlocked) {
      this._globalReloadService.unRegister(this);
    } else {
      this._globalReloadService.register(this);
    }
  });

  @ViewChild(MatTable) private table?: MatTable<any>;
  @ViewChild(PaginatorComponent, { static: true }) page!: PaginatorComponent;

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

  private contentColumns = contentChildren(ColumnDirective);

  private viewColumns = viewChildren(ColumnDirective);

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

  protected _itemsPerPageService =
    inject(ItemsPerPageService, { optional: true }) ?? inject(ItemsPerPageDefaultService);

  readonly pageSizeOptions = toSignal(this._itemsPerPageService.getItemsPerPage(), { initialValue: [] });

  readonly displayColumns = computed(() => {
    const visibleColumnsByConfig = this._tableColumns.visibleColumns();
    const visibleColumnsByInput = this.visibleColumns();
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

  private search$ = new BehaviorSubject<SearchData>({
    search: this._tableState.getSearch(),
    resetPagination: true,
  });
  private filter$ = toObservable(this.filter);
  private tableParams$ = toObservable(this.tableParams);

  readonly hasFilter$ = this.search$.pipe(
    map((value) => value.search),
    map((search) => {
      const values = Object.values(search);
      if (values.length === 0) {
        return false;
      }

      const hasFilter = values.some((searchValue) => {
        if (searchValue instanceof FilterCondition) {
          return !searchValue.isEmpty();
        }
        if (typeof searchValue === 'string') {
          return !!searchValue;
        }
        return !!searchValue?.value;
      });

      return hasFilter;
    }),
  );
  readonly hasFilter = toSignal(this.hasFilter$, { initialValue: false });

  highlightedItem?: unknown;

  private terminateDatasource(): void {
    this.dataSourceTerminator$?.next();
    this.dataSourceTerminator$?.complete();
    this.dataSourceTerminator$ = undefined;
    this.inProgressDataSource.set(false);
    this.tableSelectionList?.destroy?.();
    this.tableSelectionList = undefined;
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

    if (this._selectionState) {
      if (tableDataSource instanceof TableRemoteDataSource) {
        this.tableSelectionList =
          runInInjectionContext(this._injector, () => new TableRemoteSelectionList(tableDataSource)) || undefined;
      } else if (tableDataSource instanceof TableLocalDataSource) {
        this.tableSelectionList =
          runInInjectionContext(this._injector, () => new TableLocalSelectionList(tableDataSource)) || undefined;
      }
    }

    if (!this.page) {
      this.initRequired = true;
      return;
    }

    const sort$ = this.setupSortStream();
    const page$ = this.setupPageStream();

    const pageAndSearch$ = combineLatest({
      pageWithTimeStamp: page$.pipe(timestamp()),
      searchWithTimeStamp: this.search$.pipe(timestamp()),
    }).pipe(
      map(({ pageWithTimeStamp, searchWithTimeStamp }) => {
        const { search, resetPagination } = searchWithTimeStamp.value;
        let page = pageWithTimeStamp.value;
        // Change has been triggered, by search. In that case reset page to first one
        const isRestToFirstPage = searchWithTimeStamp.timestamp > pageWithTimeStamp.timestamp;
        if (resetPagination && isRestToFirstPage) {
          page = this.createPageInitialValue();
          this.page!.firstPage();
        }
        return { page, search };
      }),
    );

    combineLatest([pageAndSearch$, sort$, this.filter$, this.tableParams$, this.staticFilters$])
      .pipe(takeUntil(this.dataSourceTerminator$))
      .subscribe(([{ page, search }, sort, filter, params, staticFilters]) => {
        this._tableState.saveState(search, page, sort);
        const mergedSearch: Record<string, SearchValue> = { ...search, ...staticFilters };
        tableDataSource.getTableData({ page, sort, search: mergedSearch, filter, params });
      });

    tableDataSource!.forceNavigateToFirstPage$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe(() => {
      this.page!.firstPage();
    });

    tableDataSource.inProgress$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe((inProgress) => {
      this.inProgressDataSource.set(inProgress);
    });
  }

  private setupSortStream(): Observable<Sort | undefined> {
    if (!this._sort) {
      return of(undefined);
    }

    let initialSort: Sort | undefined = undefined;

    const sortState = this._tableState.getSort();

    if (sortState) {
      this._sort.active = sortState.active;
      this._sort.direction = sortState.direction;
      initialSort = sortState;
    } else if (this._sort.active) {
      const { active, direction } = this._sort;
      initialSort = { active, direction };
    }

    return this._sort.sortChange.pipe(startWith(initialSort));
  }

  private setupPageStream(): Observable<PageEvent> {
    let initialPage$: Observable<PageEvent>;

    const statePage = this._tableState.getPage();
    if (statePage) {
      this.page.pageSize.set(statePage.pageSize);
      this.page.pageIndex.set(statePage.pageIndex);
      this.page.length.update((current) => {
        if (!!current && !statePage.length) {
          return current;
        }
        return statePage.length;
      });
      initialPage$ = of(statePage);
    } else {
      this.page.firstPage();
      initialPage$ = this._itemsPerPageService
        .getDefaultPageSizeItem()
        .pipe(map((pageSize) => this.createPageInitialValue(pageSize)));
    }

    return initialPage$.pipe(switchMap((initialPage) => this.page.page$.pipe(startWith(initialPage))));
  }

  private createPageInitialValue(pageSize?: number): PageEvent {
    pageSize = pageSize ?? (this.page.pageSize() || this.pageSizeOptions()[0]);
    return {
      pageSize,
      pageIndex: 0,
      length: 0,
    };
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

  private setupDefaultSearch(): void {
    if (!this.defaultSearch) {
      return;
    }
    const searchValue = { ...this.defaultSearch, ...this.search$.value };
    this.search$.next(searchValue);
  }

  private setupExternalSearchChangeHandle(): void {
    this._tableState.externalSearchChange$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((externalSearch) => {
      this.search$.next({ search: externalSearch, resetPagination: true });
    });
  }

  onSearch(column: string, searchValue: SearchValue, resetPagination?: boolean): void;
  onSearch(column: string, value: string, regex?: boolean, resetPagination?: boolean): void;
  onSearch(
    column: string,
    searchValue: string | SearchValue,
    regexOrResetPagination: boolean = true,
    resetPaginationParam: boolean = true,
  ): void {
    const search = { ...this.search$.value.search };
    let searchCol: SearchValue;
    let regex: boolean;
    let resetPagination: boolean;
    if (typeof searchValue === 'string') {
      regex = regexOrResetPagination;
      resetPagination = resetPaginationParam;
      searchCol = regex ? { value: searchValue, regex } : searchValue;
    } else {
      resetPagination = regexOrResetPagination;
      searchCol = searchValue;
    }
    type RegexSearchValue = { regex?: boolean; value: string };
    if ((searchCol as RegexSearchValue)?.regex) {
      if (!isValidRegex((searchCol as RegexSearchValue).value)) {
        return;
      }
    }
    search[column] = searchCol;
    this.search$.next({ search, resetPagination });
  }

  getSearchValue$(column: string): Observable<SearchValue | undefined> {
    return this.search$.pipe(map((value) => value.search[column]));
  }

  getTableFilterRequest(): TableRequestData | undefined {
    const [search, filter, params] = [this.search$.value.search, this.filter(), this.tableParams()];
    return this.tableDataSource?.getFilterRequest({ search, filter, params });
  }

  reload(): void {
    this.onReload.emit({});
    this.tableDataSource?.reload();
  }

  ngOnInit(): void {
    this.setupDefaultSearch();
    this.setupExternalSearchChangeHandle();
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
    this.search$.complete();
    this._globalReloadService.unRegister(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cDatasource = changes['dataSource'];
    if (cDatasource?.previousValue !== cDatasource?.currentValue) {
      this.setupDatasource(cDatasource.currentValue);
    }
  }

  private configureColumns(): void {
    const allCollDef = this.allCollDef();
    allCollDef.forEach((col) => {
      if (!this.usedColumns.has(col.name) && !col.name.startsWith('search-')) {
        this.usedColumns.add(col.name);
        this.table!.addColumnDef(col);
      }
    });
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

  /** Selection list methods begin **/

  clearSelection(): void {
    this.tableSelectionList?.clearSelection?.();
  }

  deselect(item: T): void {
    this.tableSelectionList?.deselect?.(item);
  }

  select(item: T): void {
    this.tableSelectionList?.select?.(item);
  }

  selectAll(): void {
    this.tableSelectionList?.selectAll?.();
  }

  selectFiltered(): void {
    this.tableSelectionList?.selectFiltered?.();
  }

  selectVisible(): void {
    this.tableSelectionList?.selectVisible?.();
  }

  toggleSelection(item: T): void {
    this.tableSelectionList?.toggleSelection?.(item);
  }

  selectIds<K>(keys: K[]): void {
    this.tableSelectionList?.selectIds?.(keys);
  }

  checkCurrentSelectionState<K>(predicate: (item: T) => boolean): Map<K, boolean> | undefined {
    return this.tableSelectionList?.checkCurrentSelectionState?.(predicate) as Map<K, boolean> | undefined;
  }

  /** Selection list methods end **/
}
