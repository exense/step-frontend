import { inject, Injectable } from '@angular/core';
import { TableRequestData } from '../shared/table-request-data';
import { TableResponseGeneric } from '../shared/table-response-generic';
import { map, Observable, tap } from 'rxjs';
import { AsyncTasksService, AsyncTaskStatusResource, TablesService } from '../../generated';
import { pollAsyncTask, AsyncTaskStatus } from '../../async-task/async-task.module';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TableApiWrapperService {
  private _tables = inject(TablesService);
  private _asyncTaskService = inject(AsyncTasksService);
  private _document = inject(DOCUMENT);

  requestTable<T>(tableId: string, tableRequest: TableRequestData): Observable<TableResponseGeneric<T>> {
    return this._tables.request(tableId, tableRequest) as Observable<TableResponseGeneric<T>>;
  }

  exportTable(tableId: string, tableRequest: TableRequestData, fields: string[]): Observable<AsyncTaskStatus> {
    return this._tables.createExport(tableId, { tableRequest, fields });
  }

  exportAsCSV(tableId: string, fields: string[], tableRequest: TableRequestData = {}): Observable<string> {
    return this.exportTable(tableId, tableRequest, fields)
      .pipe(
        pollAsyncTask(this._asyncTaskService),
        map((status: AsyncTaskStatusResource) => {
          if (!status?.result?.id) {
            throw 'Invalid attachment id';
          }
          return status.result.id;
        })
      )
      .pipe(
        tap((attachmentId) => {
          this.downloadDatasource(attachmentId);
        })
      );
  }

  private downloadDatasource(id: string): void {
    const url = `rest/resources/${id}/content`;
    const $ = (this._document.defaultView as any).$;
    $.fileDownload(url)
      .done(() => {})
      .fail();
  }
}
