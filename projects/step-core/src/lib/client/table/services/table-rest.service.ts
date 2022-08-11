import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableRequestData } from '../models/table-request-data';
import { TableResponse } from '../models/table-response';
import { map, Observable } from 'rxjs';
import { ExportService } from '../../../services/export.service';
import { TableParameters } from '../models/table-parameters';

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

  requestColumnValues(tableId: string, columnName: string): Observable<string[]> {
    const url = `${ROOT}/${tableId}/column/${columnName}/distinct`;
    return this._httpClient.get<string[]>(url);
  }

  getExportUrl(tableId: string, params?: TableParameters): string {
    let url = `${ROOT}/${tableId}/export`;
    if (params) {
      url = `${url}?params=${encodeURIComponent(JSON.stringify(params))}`;
    }
    return url;
  }

  exportAsCSV(tableId: string, params?: TableParameters): void {
    const url = this.getExportUrl(tableId, params);
    this._httpClient
      .get<{ exportID: string }>(url)
      .pipe(map(({ exportID }) => `${ROOT}/exports/${exportID}`))
      .subscribe((pollUrl) => this._exportService.pollUrl(pollUrl));
  }
}
