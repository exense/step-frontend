import {
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  SimpleChanges,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of, startWith, Subject, takeUntil } from 'rxjs';
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
import { TableRequestData } from '../../../../client/table/models/table-request-data';
import { AdditionalHeaderDirective } from '../../directives/additional-header.directive';
import { TableFilter } from '../../services/table-filter';
import { TableParameters } from '../../../../client/generated';
import { TableReload } from '../../services/table-reload';
import { ItemsPerPageService } from '../../services/items-per-page.service';
import { HasFilter } from '../../../entities-selection/services/has-filter';
import { FilterCondition } from '../../shared/filter-condition';
import { SearchColumn } from '../../shared/search-column.interface';
import { TablePersistenceStateService } from '../../services/table-persistence-state.service';

export type DataSource<T> = TableDataSource<T> | T[] | Observable<T[]>;

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
    TablePersistenceStateService,
  ],
})
export class TableComponent<T>
  implements AfterViewInit, OnChanges, OnDestroy, TableSearch, TableFilter, TableReload, HasFilter
{
  @Output() onReload = new EventEmitter<unknown>();
  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: DataSource<T>;
  @Input() inProgress?: boolean;
  tableDataSource?: TableDataSource<T>;
  @Input() pageSizeInputDisabled?: boolean;
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

  private initRequired: boolean = false;
  private hasCustom: boolean = false;

  displayColumns: string[] = [];
  displaySearchColumns: string[] = [];

  searchColumns: SearchColumn[] = [];

  pageSizeOptions: Array<number>;

  readonly trackBySearchColumn: TrackByFunction<SearchColumn> = (index, item) => item.colName;

  private terminator$ = new Subject<void>();
  private dataSourceTerminator$?: Subject<void>;
  private search$ = new BehaviorSubject<{ [column: string]: SearchValue }>(this._tableState.getSearch());
  private filter$ = new BehaviorSubject<string | undefined>(undefined);
  private tableParams$ = new BehaviorSubject<TableParameters | undefined>(undefined);

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
    })
  );

  constructor(
    @Optional() private _sort: MatSort,
    _itemsPerPageService: ItemsPerPageService,
    private _tableState: TablePersistenceStateService
  ) {
    this.pageSizeOptions = _itemsPerPageService.getItemsPerPage((userPreferredItemsPerPage: number) =>
      this.page._changePageSize(userPreferredItemsPerPage)
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
    this.page.firstPage();

    const initialPage: PageEvent = {
      pageSize: this.page.pageSize || this.pageSizeOptions[0],
      pageIndex: 0,
      length: 0,
    };

    const initialSort: Sort | undefined = this._sort?.active
      ? {
          active: this._sort.active,
          direction: this._sort.direction,
        }
      : undefined;

    const page$ = this.page!.page.pipe(startWith(initialPage));
    const sort$ = this._sort ? this._sort.sortChange.pipe(startWith(initialSort)) : of(undefined);

    combineLatest([page$, sort$, this.search$, this.filter$, this.tableParams$])
      .pipe(takeUntil(this.dataSourceTerminator$))
      .subscribe(([page, sort, search, filter, params]) => {
        this._tableState.saveSearch(search);
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

  private setupSearchColumns(): void {
    const searchColDef = this.allSearchColDef;

    if (!searchColDef?.length) {
      this.searchColumns = [];
      this.displaySearchColumns = [];
      return;
    }

    const allColumns = this.allCollDef.map((x) => x.name);
    const searchColumns = searchColDef.map((x) => {
      const searchName = x.searchColumnName;
      const template = x?.searchCell?.template;
      return { searchName, template };
    });

    this.searchColumns = allColumns.map((col) => {
      const colName = `search-${col}`;
      const { searchName, template } = searchColumns.find((x) => x.searchName === col) || {};
      return { colName, searchName, template };
    });

    this.displaySearchColumns = this.searchColumns.map((c) => c.colName);
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

    const headerGroupIdToHeaders = this.additionalHeaders.reduce((result, additionalHeader) => {
      const id = additionalHeader.headerGroupId!;
      const headerGroup = (result[id] = result[id] || []);
      headerGroup.push(additionalHeader);
      return result;
    }, {} as Record<string, AdditionalHeaderDirective[]>);

    this.additionalHeaderGroups = Object.values(headerGroupIdToHeaders);
  }

  private setupColumns(): void {
    const allCollDef = this.allCollDef;

    allCollDef.forEach((col) => this._table!.addColumnDef(col));

    setTimeout(() => {
      this.displayColumns = allCollDef.map((x) => x.name);
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

  ngAfterViewInit(): void {
    const setup = () => {
      this.setupAdditionalsHeaderGroups();
      this.setupColumns();
      this.setupSearchColumns();

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
      ready$.pipe(takeUntil(this.terminator$)).subscribe(setup);
    }
  }

  ngOnDestroy(): void {
    this.terminateDatasource();
    this.search$.complete();
    this.filter$.complete();
    this.tableParams$.complete();
    this.terminator$.next();
    this.terminator$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cDatasource = changes['dataSource'];
    if (cDatasource?.previousValue !== cDatasource?.currentValue) {
      this.setupDatasource(cDatasource.currentValue);
    }
  }

  exportAsCSV(fields: string[]): void {
    if (!this.tableDataSource) {
      console.error('No datasource for export');
      return;
    }
    this.tableDataSource.exportAsCSV(fields, this.tableParams);
  }
}
