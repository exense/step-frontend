import { inject, Injectable } from '@angular/core';
import { TableApiWrapperService, TableRemoteDataSourceFactoryService } from '../../../client/step-client-module';
import { TableRemoteDataSource } from '../shared/table-remote-data-source';
import { TableDataSource } from '../shared/table-data-source';

@Injectable({
  providedIn: 'root',
})
export class TableRemoteDataSourceFactoryImplService implements TableRemoteDataSourceFactoryService {
  private _tableRest = inject(TableApiWrapperService);

  createDataSource<T>(
    tableId: string,
    requestColumnsMap: Record<string, string>,
    filters?: Record<string, string[]>,
  ): TableDataSource<T> {
    return new TableRemoteDataSource(tableId, this._tableRest, requestColumnsMap, filters);
  }
}
