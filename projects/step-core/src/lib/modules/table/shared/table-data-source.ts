import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { SearchValue } from './search-value';
import {
  StepDataSource,
  StepDataSourceReloadOptions,
  TableRequestData,
  TableParameters,
} from '../../../client/step-client-module';
import { StepPageEvent } from '../types/step-page-event';

export interface TableFilterOptions {
  search?: { [key: string]: SearchValue };
  filter?: string;
  params?: TableParameters;
}
export interface TableGetDataOptions extends TableFilterOptions {
  page?: StepPageEvent;
  sort?: Sort;
  calculateCounts?: boolean;
}

export interface TableDataSource<T> extends StepDataSource<T> {
  readonly inProgress$: Observable<boolean>;
  readonly hasNext$: Observable<boolean>;
  readonly totalFiltered$: Observable<number>;
  readonly forceNavigateToFirstPage$: Observable<unknown>;
  getTableData(options?: TableGetDataOptions): void;
  getFilterRequest(options?: TableFilterOptions): TableRequestData | undefined;
  reload(reloadOptions?: StepDataSourceReloadOptions): void;
  exportAsCSV(fields: string[], params?: TableParameters): void;
  sharable(): this;
  destroy(): void;
}
