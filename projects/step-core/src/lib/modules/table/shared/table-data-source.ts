import { DataSource } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { SearchValue } from './search-value';
import { TableRequestData } from '../../../client/table/step-table-client.module';
import { TableParameters } from '../../../client/generated';

export interface TableDataSource<T> extends DataSource<T> {
  readonly inProgress$: Observable<boolean>;
  readonly total$: Observable<number>;
  readonly totalFiltered$: Observable<number>;
  getTableData(
    page?: PageEvent,
    sort?: Sort,
    search?: { [key: string]: SearchValue },
    filter?: string,
    params?: TableParameters
  ): void;
  getFilterRequest(
    search?: { [key: string]: SearchValue },
    filter?: string,
    params?: TableParameters
  ): TableRequestData | undefined;
  reload(reloadOptions?: { hideProgress: boolean }): void;
  exportAsCSV(fields: string[], params?: TableParameters): void;
}
