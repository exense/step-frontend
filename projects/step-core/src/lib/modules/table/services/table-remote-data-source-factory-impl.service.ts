import { inject, Injectable } from '@angular/core';
import {
  StepDataSource,
  TableApiWrapperService,
  TableRemoteDataSourceFactoryService,
} from '../../../client/step-client-module';
import { TableRemoteDataSource } from '../shared/table-remote-data-source';

@Injectable({
  providedIn: 'root',
})
export class TableRemoteDataSourceFactoryImplService implements TableRemoteDataSourceFactoryService {
  private _tableRest = inject(TableApiWrapperService);

  createDataSource<T>(
    tableId: string,
    requestColumnsMap: Record<string, string>,
    filters?: Record<string, string[]>
  ): StepDataSource<T> {
    return new TableRemoteDataSource(tableId, this._tableRest, requestColumnsMap, filters);
  }
}
