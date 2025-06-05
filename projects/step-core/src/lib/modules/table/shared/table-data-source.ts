import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { SearchValue } from './search-value';
import {
  StepDataSource,
  StepDataSourceReloadOptions,
  TableRequestData,
  TableParameters,
} from '../../../client/step-client-module';

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
  reload(reloadOptions?: StepDataSourceReloadOptions): void;
  exportAsCSV(fields: string[], params?: TableParameters): void;
  sharable(): this;
  destroy(): void;
}
