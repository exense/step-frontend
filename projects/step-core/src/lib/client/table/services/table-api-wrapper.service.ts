import { inject, Injectable } from '@angular/core';
import { TableRequestData } from '../shared/table-request-data';
import { TableResponseGeneric } from '../shared/table-response-generic';
import { map, Observable, pipe, tap } from 'rxjs';
import { AsyncTasksService, AsyncTaskStatusResource, TablesService } from '../../generated';
import { pollAsyncTask, AsyncTaskStatus } from '../../async-task/async-task.module';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TableApiWrapperService {
  private _httpClient = inject(HttpClient);
  private _tables = inject(TablesService);
  private _asyncTaskService = inject(AsyncTasksService);
  private _document = inject(DOCUMENT);

  private proceedAsyncRequest = pipe(
    pollAsyncTask(this._asyncTaskService),
    map((status: AsyncTaskStatusResource) => {
      if (!status?.result?.id) {
        throw 'Invalid attachment id';
      }
      return status.result.id;
    }),
    tap((attachmentId) => this.downloadDatasource(attachmentId))
  );

  requestTable<T>(tableId: string, tableRequest: TableRequestData): Observable<TableResponseGeneric<T>> {
    return this._tables.request(tableId, tableRequest) as Observable<TableResponseGeneric<T>>;
  }

  exportTable(tableId: string, tableRequest: TableRequestData, fields: string[]): Observable<AsyncTaskStatus> {
    return this._tables.createExport(tableId, { tableRequest, fields });
  }

  exportAsCSV(tableId: string, fields: string[], tableRequest: TableRequestData = {}): Observable<string> {
    return this.exportTable(tableId, tableRequest, fields).pipe(this.proceedAsyncRequest);
  }

  exportAsCSVByUrl(url: string): Observable<string> {
    return this._httpClient.get(url).pipe(this.proceedAsyncRequest);
  }

  private downloadDatasource(id: string): void {
    const url = `rest/resources/${id}/content`;
    const $ = (this._document.defaultView as any).$;
    $.fileDownload(url)
      .done(() => {})
      .fail();
  }
}
