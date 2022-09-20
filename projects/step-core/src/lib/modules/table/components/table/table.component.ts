import {
  AfterViewInit,
  Component,
  ContentChild,
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
  TemplateRef,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, startWith, Subject, takeUntil } from 'rxjs';
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

export interface SearchColumn {
  colName: string;
  searchName?: string;
  template?: TemplateRef<any>;
}

export type DataSource<T> = TableDataSource<T> | T[] | Observable<T[]>;

@Component({
  selector: 'step-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
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
  ],
})
export class TableComponent<T> implements AfterViewInit, OnChanges, OnDestroy, TableSearch, TableFilter, TableReload {
  @Output() onReload = new EventEmitter<unknown>();
  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: DataSource<T>;
  @Input() inProgress?: boolean;
  tableDataSource?: TableDataSource<T>;
  @Input() pageSizeOptions: ReadonlyArray<number> = [10, 25, 50, 100];
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

  @ContentChild(AdditionalHeaderDirective) additionalHeader?: AdditionalHeaderDirective;
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

  readonly trackBySearchColumn: TrackByFunction<SearchColumn> = (index, item) => item.colName;

  private terminator$ = new Subject();
  private dataSourceTerminator$?: Subject<unknown>;
  private search$ = new BehaviorSubject<{ [column: string]: SearchValue }>({});
  private filter$ = new BehaviorSubject<string | undefined>(undefined);
  private tableParams$ = new BehaviorSubject<TableParameters | undefined>(undefined);

  constructor(@Optional() private _sort: MatSort) {}

  private terminateDatasource(): void {
    if (this.dataSourceTerminator$) {
      this.dataSourceTerminator$.next({});
      this.dataSourceTerminator$.complete();
    }
  }

  private setupDatasource(dataSource?: DataSource<T>): void {
    this.terminateDatasource();
    this.dataSourceTerminator$ = new Subject<unknown>();

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

    const initialPage: PageEvent = {
      pageSize: this.pageSizeOptions[0] || 10,
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
      .subscribe(([page, sort, search, filter, tableParams]) =>
        tableDataSource.getTableData(page, sort, search, filter, tableParams)
      );
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

  getTableFilterRequest(): TableRequestData | undefined {
    return this.tableDataSource?.getFilterRequest(this.search$.value, this.filter$.value, this.tableParams$.value);
  }

  reload(): void {
    this.onReload.emit({});
    this.tableDataSource?.reload();
  }

  ngAfterViewInit(): void {
    const setup = () => {
      this.setupColumns();
      this.setupSearchColumns();

      if (this.initRequired) {
        this.setupDatasource(this.dataSource);
      }

      this.addCustomColumnsDefinitionsToRemoteDatasource();
    };

    const customCols = this.columns?.filter((col) => col.isCustom) || [];

    if (!customCols?.length) {
      setup();
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
    this.terminator$.next({});
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
