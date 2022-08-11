import { DataSource } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { SearchValue } from './search-value';

export interface TableDataSource<T> extends DataSource<T> {
  readonly inProgress$: Observable<boolean>;
  readonly total$: Observable<number>;
  readonly totalFiltered$: Observable<number>;
  getTableData(
    page?: PageEvent,
    sort?: Sort,
    search?: { [key: string]: SearchValue },
    filter?: string,
    params?: unknown
  ): void;
  exportAsCSV(params?: unknown): void;
  reload(): void;
}
