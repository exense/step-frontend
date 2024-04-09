import {
  AfterViewInit,
  Component,
  computed,
  contentChildren,
  ContentChildren,
  DestroyRef,
  EventEmitter,
  forwardRef,
  inject,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
  viewChild,
  ViewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of, startWith, Subject, takeUntil, timestamp } from 'rxjs';
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
import { ItemsPerPageService } from '../../services/items-per-page.service';
import { HasFilter } from '../../../entities-selection/services/has-filter';
import { FilterCondition } from '../../shared/filter-condition';
import { SearchColumn } from '../../shared/search-column.interface';
import { TablePersistenceStateService } from '../../services/table-persistence-state.service';
import { TableHighlightItemContainer } from '../../services/table-highlight-item-container.service';
import { TablePersistenceUrlStateService } from '../../services/table-persistence-url-state.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';
import { PaginatorComponent } from '../paginator/paginator.component';
import { CustomColumnsComponent } from '../custom-columns/custom-columns.component';
import { TableColumnsService } from '../../services/table-columns.service';
import { TableColumnsDefinitionService } from '../../services/table-columns-definition.service';
import { TableColumnsDictionaryService } from '../../services/table-columns-dictionary.service';
import { ColumnInfo } from '../../types/column-info';

export type DataSource<T> = StepDataSource<T> | TableDataSource<T> | T[] | Observable<T[]>;

@Component({
  selector: 'step-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
    {
      provide: TablePersistenceStateService,
      useClass: TablePersistenceUrlStateService,
    },
    {
      provide: TableColumnsDictionaryService,
      useExisting: forwardRef(() => TableComponent),
    },
    TablePersistenceStateService,
    TableColumnsDefinitionService,
    TableCustomColumnsService,
    TableColumnsService,
  ],
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
    TableColumnsDictionaryService
{
  private _tableState = inject(TablePersistenceStateService);
  private _sort = inject(MatSort, { optional: true });
  private _destroyRef = inject(DestroyRef);
  readonly _tableColumns = inject(TableColumnsService);

  private initRequired: boolean = false;
  private hasCustom: boolean = false;

  searchColumns: SearchColumn[] = [];

  private dataSourceTerminator$?: Subject<void>;

  @Output() onReload = new EventEmitter<unknown>();
  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: DataSource<T>;

  /** @Input() **/
  inProgress = input(false);

  tableDataSource?: TableDataSource<T>;

  /** @Input() **/
  pageSizeInputDisabled = input(false);

  /** @Input() **/
  visibleColumns = input(undefined, {
    transform: (source?: string[]) => (!!source ? new Set<string>(source) : undefined),
  });

  @Input() defaultSearch?: Record<string, SearchValue>;

  /** @Input() **/
  filter = input<string | undefined>(undefined);

  /** @Input() **/
  tableParams = input<TableParameters | undefined>(undefined);

  @ViewChild(MatTable) private table?: MatTable<any>;
  @ViewChild(PaginatorComponent, { static: true }) page!: PaginatorComponent;

  @ContentChildren(AdditionalHeaderDirective) additionalHeaders?: QueryList<AdditionalHeaderDirective>;
  additionalHeaderGroups?: Array<Array<AdditionalHeaderDirective>>;

  /**
   * @ContentChildrent(ColumnDirective)
   * **/
  private contentColumns = contentChildren(ColumnDirective);

  /**
   * @ViewChildren(ColumnDirective)
   * **/
  private viewColumns = viewChildren(ColumnDirective);

  private columns = computed(() => [...this.contentColumns(), ...this.viewColumns()]);

  readonly columnsDictionary = computed(() => {
    return (this.columns() ?? []).reduce((res, column) => res.concat(column.columnInfos), [] as ColumnInfo[]);
  });

  private allCollDef = computed(() => {
    return (this.columns() ?? []).reduce((res, col) => [...res, ...col.columnDefinitions], [] as MatColumnDef[]);
  });

  private allSearchColDef = computed(() => {
    return (this.columns() ?? [])
      .reduce((res, col) => [...res, ...col.searchColumnDefinitions], [] as SearchColDirective[])
      .filter((x) => !x.isSearchDisabled);
  });

  /**
   * @ViewChildren(CustomColumns)
   * **/
  private customRemoteColumns = viewChild(CustomColumnsComponent);

  readonly pageSizeOptions = inject(ItemsPerPageService).getItemsPerPage((userPreferredItemsPerPage) =>
    this.page.pageSize.set(userPreferredItemsPerPage),
  );

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

  constructor(_columnDefinitions: TableColumnsDefinitionService) {
    _columnDefinitions.setup(this.contentColumns, this.customRemoteColumns);
  }

  private search$ = new BehaviorSubject<Record<string, SearchValue>>(this._tableState.getSearch());
  private filter$ = toObservable(this.filter);
  private tableParams$ = toObservable(this.tableParams);

  readonly hasFilter$ = this.search$.pipe(
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

  highlightedItem?: unknown;

  private terminateDatasource(): void {
    this.dataSourceTerminator$?.next();
    this.dataSourceTerminator$?.complete();
    this.dataSourceTerminator$ = undefined;
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
        const search = searchWithTimeStamp.value;
        let page = pageWithTimeStamp.value;
        // Change has been triggered, by search. In that case reset page to first one
        const isRestToFirstPage = searchWithTimeStamp.timestamp > pageWithTimeStamp.timestamp;
        if (isRestToFirstPage) {
          page = this.createPageInitialValue();
          this.page!.firstPage();
        }
        return { page, search };
      }),
    );

    combineLatest([pageAndSearch$, sort$, this.filter$, this.tableParams$])
      .pipe(takeUntil(this.dataSourceTerminator$))
      .subscribe(([{ page, search }, sort, filter, params]) => {
        this._tableState.saveState(search, page, sort);
        tableDataSource.getTableData({ page, sort, search, filter, params });
      });

    tableDataSource.forceNavigateToFirstPage$.pipe(takeUntil(this.dataSourceTerminator$)).subscribe(() => {
      this.page!.firstPage();
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
    let initialPage: PageEvent;

    const statePage = this._tableState.getPage();
    if (statePage) {
      this.page.pageSize.set(statePage.pageSize);
      this.page.pageIndex.set(statePage.pageIndex);
      this.page.length.set(statePage.length);
      initialPage = statePage;
    } else {
      this.page.firstPage();
      initialPage = this.createPageInitialValue();
    }

    return this.page.page$.pipe(startWith(initialPage));
  }

  private createPageInitialValue(): PageEvent {
    return {
      pageSize: this.page.pageSize() || this.pageSizeOptions[0],
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
      this.search$.next(externalSearch);
    });
  }

  onSearch(column: string, searchValue: SearchValue): void;
  onSearch(column: string, value: string, regex?: boolean): void;
  onSearch(column: string, searchValue: string | SearchValue, regex: boolean = true): void {
    const search = { ...this.search$.value };
    if (typeof searchValue === 'string') {
      search[column] = regex ? { value: searchValue, regex } : searchValue;
    } else {
      search[column] = searchValue;
    }
    this.search$.next(search);
  }

  getSearchValue$(column: string): Observable<SearchValue | undefined> {
    return this.search$.pipe(map((value) => value[column]));
  }

  getTableFilterRequest(): TableRequestData | undefined {
    const [search, filter, params] = [this.search$.value, this.filter(), this.tableParams()];
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
      this._tableColumns.initialize();

      if (this.initRequired) {
        this.setupDatasource(this.dataSource);
      }

      this.addCustomColumnsDefinitionsToRemoteDatasource();
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cDatasource = changes['dataSource'];
    if (cDatasource?.previousValue !== cDatasource?.currentValue) {
      this.setupDatasource(cDatasource.currentValue);
    }
  }

  private configureColumns(): void {
    const allCollDef = this.allCollDef();
    allCollDef.forEach((col) => this.table!.addColumnDef(col));
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
}
