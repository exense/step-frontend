import { Inject, Injectable } from '@angular/core';
import { TableRequestData } from '../models/table-request-data';
import { TableResponse } from '../models/table-response';
import { map, Observable } from 'rxjs';
import { AsyncTasksService, AsyncTaskStatusResource, AsyncTaskStatusVoid, TablesService } from '../../generated';
import { pollAsyncTask } from '../../augmented/rxjs-operators/poll-async-task';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TableApiWrapperService {
  constructor(
    private _tables: TablesService,
    private _asyncTaskService: AsyncTasksService,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  requestTable<T>(tableId: string, tableRequest: TableRequestData): Observable<TableResponse<T>> {
    return this._tables.request(tableId, tableRequest) as Observable<TableResponse<T>>;
  }

  exportTable(tableId: string, tableRequest: TableRequestData, fields: string[]): Observable<AsyncTaskStatusVoid> {
    return this._tables.createExport(tableId, { tableRequest, fields });
  }

  exportAsCSV(tableId: string, fields: string[], tableRequest: TableRequestData = {}): void {
    this.exportTable(tableId, tableRequest, fields)
      .pipe(
        pollAsyncTask(this._asyncTaskService),
        map((status: AsyncTaskStatusResource) => {
          if (!status?.result?.id) {
            throw 'Invalid attachment id';
          }
          return status.result.id;
        })
      )
      .subscribe((attachmentId) => {
        this.downloadDatasource(attachmentId);
      });
  }

  private downloadDatasource(id: string): void {
    const url = `rest/resources/${id}/content`;
    const $ = (this._document.defaultView as any).$;
    $.fileDownload(url)
      .done(() => {})
      .fail();
  }
}
