import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { SearchValue } from './search-value';
import { StepDataSource, TableRequestData } from '../../../client/table/step-table-client.module';
import { TableParameters } from '../../../client/generated';

export interface TableFilterOptions {
  search?: { [key: string]: SearchValue };
  filter?: string;
  params?: TableParameters;
}
export interface TableGetDataOptions extends TableFilterOptions {
  page?: PageEvent;
  sort?: Sort;
}

export interface TableDataSource<T> extends StepDataSource<T> {
  readonly inProgress$: Observable<boolean>;
  readonly total$: Observable<number>;
  readonly totalFiltered$: Observable<number>;
  readonly forceNavigateToFirstPage$: Observable<unknown>;
  getTableData(options?: TableGetDataOptions): void;
  getFilterRequest(options?: TableFilterOptions): TableRequestData | undefined;
  reload(reloadOptions?: { hideProgress: boolean }): void;
  exportAsCSV(fields: string[], params?: TableParameters): void;
  sharable(): this;
  destroy(): void;
}
