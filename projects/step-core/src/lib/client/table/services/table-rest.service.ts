import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableRequestData } from '../models/table-request-data';
import { TableResponse } from '../models/table-response';
import { Observable } from 'rxjs';
import { ExportService } from '../../../services/export.service';
import { ExportStatus } from '../../generated';

const ROOT = 'rest/table';

@Injectable({
  providedIn: 'root',
})
export class TableRestService {
  constructor(private _httpClient: HttpClient, private _exportService: ExportService) {}

  requestTable<T>(tableId: string, tableRequest: TableRequestData): Observable<TableResponse<T>> {
    const url = `${ROOT}/${tableId}`;
    return this._httpClient.post<TableResponse<T>>(url, tableRequest);
  }

  exportTable(tableId: string, tableRequest: TableRequestData, fields: string[]): Observable<ExportStatus> {
    const url = `${ROOT}/${tableId}/export`;
    return this._httpClient.post<ExportStatus>(url, { tableRequest, fields });
  }

  exportAsCSV(tableId: string, fields: string[], tableRequest: TableRequestData = {}): void {
    this.exportTable(tableId, tableRequest, fields).subscribe((exportStatus) => {
      this._exportService.poll(exportStatus.id!);
    });
  }
}
