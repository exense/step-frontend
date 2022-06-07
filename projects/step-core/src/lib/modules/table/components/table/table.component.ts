import {
  AfterViewInit,
  Component,
  ContentChildren,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
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
import { TableSearch } from '../../services/table.search';
import { SearchValue } from '../../shared/search-value';

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
  ],
})
export class TableComponent<T> implements AfterViewInit, OnChanges, OnDestroy, TableSearch {
  constructor(@Optional() private _sort: MatSort) {}

  private _terminator$?: Subject<unknown>;
  private _search$ = new BehaviorSubject<{ [column: string]: SearchValue }>({});

  private terminate(): void {
    if (this._terminator$) {
      this._terminator$.next({});
      this._terminator$.complete();
    }
  }

  private setupDatasource(dataSource?: DataSource<T>): void {
    this.terminate();
    this._terminator$ = new Subject<unknown>();

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
      this._initRequired = true;
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

    combineLatest([page$, sort$, this._search$])
      .pipe(takeUntil(this._terminator$))
      .subscribe(([page, sort, search]) => tableDataSource.getTableData(page, sort, search));
  }

  private setupSearchColumns(): void {
    if (!this.searchColDef?.length) {
      this.searchColumns = [];
      this.displaySearchColumns = [];
      return;
    }

    const allColumns = this.colDef!.map((x) => x.name);
    const searchColumns = this.searchColDef!.map((x) => {
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

  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: DataSource<T>;
  @Input() inProgress?: boolean;
  tableDataSource?: TableDataSource<T>;
  @Input() pageSizeOptions: ReadonlyArray<number> = [10, 25, 50, 100];

  @ViewChild(MatTable) private _table?: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) page!: MatPaginator;
  @ContentChildren(MatColumnDef, { descendants: true }) colDef?: QueryList<MatColumnDef>;
  @ContentChildren(SearchColDirective) searchColDef?: QueryList<SearchColDirective>;

  private _initRequired: boolean = false;

  displayColumns: string[] = [];
  displaySearchColumns: string[] = [];

  searchColumns: SearchColumn[] = [];

  readonly trackBySearchColumn: TrackByFunction<SearchColumn> = (index, item) => item.colName;

  onSearch(column: string, value: string, regex?: boolean): void;
  onSearch(column: string, event: Event, regex?: boolean): void;
  onSearch(column: string, eventOrValue: Event | string, regex: boolean = false): void {
    const value =
      typeof eventOrValue === 'string'
        ? (eventOrValue as string)
        : ((eventOrValue as Event)?.target as HTMLInputElement).value || '';

    const search = { ...this._search$.value };
    search[column] = regex ? { value, regex } : value;
    this._search$.next(search);
  }

  ngAfterViewInit(): void {
    this.colDef?.forEach((col) => this._table!.addColumnDef(col));
    setTimeout(() => {
      this.displayColumns = this.colDef!.map((x) => x.name);
    });

    this.setupSearchColumns();

    if (this._initRequired) {
      this.setupDatasource(this.dataSource);
    }
  }

  ngOnDestroy(): void {
    this.terminate();
    this._search$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cDatasource = changes['dataSource'];
    if (cDatasource?.previousValue !== cDatasource?.currentValue) {
      this.setupDatasource(cDatasource.currentValue);
    }
  }
}
