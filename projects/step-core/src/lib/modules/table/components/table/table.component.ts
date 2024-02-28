import {
  AfterViewInit,
  Component,
  ContentChildren,
  DestroyRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of, startWith, Subject, takeUntil, timestamp } from 'rxjs';
import { TableDataSource } from '../../shared/table-data-source';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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
import { TableColumnsMove } from '../../services/table-columns-move';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableColumnsReconfigure } from '../../services/table-columns-reconfigure';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';

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
      provide: TableColumnsMove,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: TableColumnsReconfigure,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: TablePersistenceStateService,
      useClass: TablePersistenceUrlStateService,
    },
    TablePersistenceStateService,
    TableCustomColumnsService,
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
    TableColumnsMove,
    TableColumnsReconfigure
{
  private _tableState = inject(TablePersistenceStateService);
  private _destroyRef = inject(DestroyRef);

  private initRequired: boolean = false;
  private hasCustom: boolean = false;
  private columnsOrder = this._tableState.getColumnsOrder();

  displayColumns: string[] = [];
  displaySearchColumns: string[] = [];

  searchColumns: SearchColumn[] = [];

  pageSizeOptions: Array<number>;
  readonly trackBySearchColumn: TrackByFunction<SearchColumn> = (index, item) => item.colName;

  private dataSourceTerminator$?: Subject<void>;
  private search$ = new BehaviorSubject<Record<string, SearchValue>>(this._tableState.getSearch());
  private filter$ = new BehaviorSubject<string | undefined>(undefined);
  private tableParams$ = new BehaviorSubject<TableParameters | undefined>(undefined);

  @Output() onReload = new EventEmitter<unknown>();
  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: DataSource<T>;
  @Input() inProgress?: boolean;
  tableDataSource?: TableDataSource<T>;
  @Input() pageSizeInputDisabled?: boolean;
  @Input({ transform: (source?: string[]) => (!!source ? new Set<string>(source) : undefined) })
  visibleColumns?: Set<string>;
  @Input() defaultSearch?: Record<string, SearchValue>;

  @Input() set filter(value: string | undefined) {
    if (value === this.filter) {
      return;
    }
    this.filter$.next(value);
  }

  get filter(): string | undefined {
    return this.filter$.value;
  }

  @Input() set tableParams(value: TableParameters | undefined) {
    if (value === this.tableParams) {
      return;
    }
    this.tableParams$.next(value);
  }

  get tableParams(): TableParameters | undefined {
    return this.tableParams$.value;
  }

  @ViewChild(MatTable) private _table?: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) page!: MatPaginator;

  @ContentChildren(AdditionalHeaderDirective) additionalHeaders?: QueryList<AdditionalHeaderDirective>;
  additionalHeaderGroups?: Array<Array<AdditionalHeaderDirective>>;
  @ContentChildren(ColumnDirective) columns?: QueryList<ColumnDirective>;

  private get allCollDef(): MatColumnDef[] {
    return (this.columns || []).reduce((res, col) => [...res, ...col.columnDefinitions], [] as MatColumnDef[]);
  }

  private get allSearchColDef(): SearchColDirective[] {
    return (this.columns || [])
      .reduce((res, col) => [...res, ...col.searchColumnDefinitions], [] as SearchColDirective[])
      .filter((x) => !x.isSearchDisabled);
  }

  private get orderedColumns(): string[] {
    const configuredColumns = new Set(this.allCollDef.map((col) => col.name));
    return this.columnsOrder.filter((col) => configuredColumns.has(col));
  }

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

  constructor(
    @Optional() private _sort: MatSort,
    _itemsPerPageService: ItemsPerPageService,
  ) {
    this.pageSizeOptions = _itemsPerPageService.getItemsPerPage((userPreferredItemsPerPage: number) =>
      this.page._changePageSize(userPreferredItemsPerPage),
    );
  }

  private terminateDatasource(): void {
    if (this.dataSourceTerminator$) {
      this.dataSourceTerminator$.next();
      this.dataSourceTerminator$.complete();
    }
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
      // Unfortunately firstPage method invoking doesn't trigger page change event.
      // It just updates the page index in component and redraw it.
      // To trigger the event _changePageSize is invoked
      this.page!.firstPage();
      this.page!._changePageSize(this.page.pageSize);
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
      this.page.pageSize = statePage.pageSize;
      this.page.pageIndex = statePage.pageIndex;
      this.page.length = statePage.length;
      initialPage = statePage;
    } else {
      this.page.firstPage();
      initialPage = this.createPageInitialValue();
    }

    return this.page.page.pipe(startWith(initialPage));
  }

  private createPageInitialValue(): PageEvent {
    return {
      pageSize: this.page.pageSize || this.pageSizeOptions[0],
      pageIndex: 0,
      length: 0,
    };
  }

  private addCustomColumnsDefinitionsToRemoteDatasource(): void {
    if (this.dataSource instanceof TableRemoteDataSource && this.hasCustom) {
      this.columns!.reduce((res, col) => {
        if (!col.isCustom) {
          return res;
        }
        const names = col.columnDefinitions.map((x) => x.name);
        return [...res, ...names];
      }, [] as string[]).forEach((name) => {
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

  getSearchValue(column: string): SearchValue | undefined {
    return this.search$.value[column];
  }

  getTableFilterRequest(): TableRequestData | undefined {
    const [search, filter, params] = [this.search$.value, this.filter$.value, this.tableParams$.value];
    return this.tableDataSource?.getFilterRequest({ search, filter, params });
  }

  reload(): void {
    this.onReload.emit({});
    this.tableDataSource?.reload();
  }

  moveColumn(column: string, placeRelativeToColumn: string, placePosition: 'left' | 'right'): void {
    if (!this.columnsOrder.includes(column) || !this.columnsOrder.includes(placeRelativeToColumn)) {
      return;
    }
    const columns = this.columnsOrder.filter((col) => col !== column);
    let relativeIndex = columns.indexOf(placeRelativeToColumn);
    if (placePosition === 'right') {
      relativeIndex++;
    }
    if (relativeIndex >= columns.length) {
      columns.push(column);
    } else {
      columns.splice(relativeIndex, 0, column);
    }
    this.columnsOrder = columns;
    this._tableState.saveColumnsOrder(this.columnsOrder);
    this.showConfiguredColumns(this.visibleColumns);
  }

  reconfigureColumns(): void {
    this.configureColumns();
    this.configureSearchColumns();
    this.showConfiguredColumns(this.visibleColumns);
    this.addCustomColumnsDefinitionsToRemoteDatasource();
  }

  ngOnInit(): void {
    this.setupDefaultSearch();
  }

  ngAfterViewInit(): void {
    const setup = () => {
      this.setupAdditionalsHeaderGroups();
      this.configureColumns();
      this.configureSearchColumns();
      setTimeout(() => {
        this.showConfiguredColumns(this.visibleColumns);
      });

      if (this.initRequired) {
        this.setupDatasource(this.dataSource);
      }

      this.addCustomColumnsDefinitionsToRemoteDatasource();
    };

    const customCols = this.columns?.filter((col) => col.isCustom) || [];

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
    this.filter$.complete();
    this.tableParams$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cDatasource = changes['dataSource'];
    if (cDatasource?.previousValue !== cDatasource?.currentValue) {
      this.setupDatasource(cDatasource.currentValue);
    }
    const visibleColumns = changes['visibleColumns'];
    if (visibleColumns?.previousValue !== visibleColumns?.currentValue) {
      this.showConfiguredColumns(visibleColumns.currentValue);
    }
  }

  private configureColumns(): void {
    const allCollDef = this.allCollDef;

    allCollDef.forEach((col) => this._table!.addColumnDef(col));
    const columnNames = allCollDef.map((col) => col.name);

    if (!this.columnsOrder?.length) {
      this.columnsOrder = columnNames;
      this._tableState.saveColumnsOrder(this.columnsOrder);
    } else {
      const existingColumns = new Set(this.columnsOrder);
      const newColumns = columnNames.filter((col) => !existingColumns.has(col));
      if (newColumns.length) {
        this.columnsOrder.push(...newColumns);
        this._tableState.saveColumnsOrder(this.columnsOrder);
      }
    }
  }

  private configureSearchColumns(): void {
    const searchColDef = this.allSearchColDef;

    if (!searchColDef?.length) {
      this.searchColumns = [];
      this.displaySearchColumns = [];
      return;
    }

    const searchColumns = searchColDef.reduce((res, x) => {
      const searchName = x.searchColumnName;
      const template = x?.searchCell?.template;
      res.set(searchName, { searchName, template });
      return res;
    }, new Map<string, { searchName?: string; template?: TemplateRef<any> }>());

    this.searchColumns = this.allCollDef.map((col) => {
      const colName = `search-${col.name}`;
      const { searchName, template } = searchColumns.get(col.name) ?? {};
      return { colName, searchName, template };
    });
  }

  private showConfiguredColumns(visibleColumns?: Set<string>): void {
    const displayColumns = !visibleColumns
      ? this.orderedColumns
      : this.orderedColumns.filter((colName) => visibleColumns.has(colName));
    const searchColumnNames = displayColumns.map((col) => `search-${col}`);
    const configuredSearchColumnNames = new Set(this.searchColumns.map((col) => col.colName));
    const displaySearchColumns = searchColumnNames.filter((col) => configuredSearchColumnNames.has(col));

    this.displayColumns = displayColumns;
    this.displaySearchColumns = displaySearchColumns;
  }

  exportAsCSV(fields: string[]): void {
    if (!this.tableDataSource) {
      console.error('No datasource for export');
      return;
    }
    this.tableDataSource.exportAsCSV(fields, this.tableParams);
  }
}
