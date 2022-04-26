import {
  AfterViewInit,
  Component,
  ContentChildren,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  QueryList,
  SimpleChanges,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, combineLatest, of, startWith, Subject, takeUntil } from 'rxjs';
import { TableDataSource } from '../../shared/table-data-source';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SearchColDirective } from '../../directives/search-col.directive';

export interface SearchColumn {
  colName: string;
  searchName?: string;
}

@Component({
  selector: 'step-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T> implements AfterViewInit, OnChanges, OnDestroy {
  constructor(@Optional() private _sort: MatSort) {}

  private _terminator$?: Subject<unknown>;
  private _search$ = new BehaviorSubject<{ [column: string]: string }>({});

  private terminate(): void {
    if (this._terminator$) {
      this._terminator$.next({});
      this._terminator$.complete();
    }
  }

  private setupRemoteDatasource(dataSource?: TableDataSource<T>): void {
    this.terminate();
    this._terminator$ = new Subject<unknown>();

    if (!dataSource) {
      return;
    }

    if (!this.page) {
      this._initRequired = true;
      return;
    }

    const page$ = this.page!.page.pipe(startWith(undefined));
    const sort$ = this._sort ? this._sort.sortChange.pipe(startWith(undefined)) : of(undefined);

    combineLatest([page$, sort$, this._search$])
      .pipe(takeUntil(this._terminator$))
      .subscribe(([page, sort, search]) => dataSource.getTableData(page, sort, search));
  }

  private setupSearchColumns(): void {
    if (!this.searchColDef?.length) {
      this.searchColumns = [];
      this.displaySearchColumns = [];
      return;
    }

    const allColumns = this.colDef!.map((x) => x.name);
    const searchColumns = this.searchColDef!.map((x) => x.searchColumnName);

    this.searchColumns = allColumns.map((col) => {
      const colName = `search-${col}`;
      const searchName = searchColumns.includes(col) ? col : undefined;
      return { colName, searchName };
    });

    this.displaySearchColumns = this.searchColumns.map((c) => c.colName);
  }

  @Input() trackBy: TrackByFunction<T> = (index) => index;
  @Input() dataSource?: TableDataSource<T>;
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

  onSearch(column: string, event: Event): void {
    const value = (event?.target as HTMLInputElement).value || '';
    const search = { ...this._search$.value };
    search[column] = value;
    this._search$.next(search);
  }

  ngAfterViewInit(): void {
    this.colDef?.forEach((col) => this._table!.addColumnDef(col));
    setTimeout(() => {
      this.displayColumns = this.colDef!.map((x) => x.name);
    });

    this.setupSearchColumns();

    if (this._initRequired) {
      this.setupRemoteDatasource(this.dataSource);
    }
  }

  ngOnDestroy(): void {
    this.terminate();
    this._search$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cDatasource = changes['dataSource'];
    if (cDatasource?.previousValue !== cDatasource?.currentValue) {
      this.setupRemoteDatasource(cDatasource.currentValue);
    }
  }
}
