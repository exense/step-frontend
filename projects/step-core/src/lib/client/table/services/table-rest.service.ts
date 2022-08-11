import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TableRequestData } from '../models/table-request-data';
import { TableResponse } from '../models/table-response';
import { map, Observable } from 'rxjs';
import { ExportService } from '../../../services/export.service';

const ROOT = 'rest/table';

@Injectable({
  providedIn: 'root',
})
export class TableRestService {
  constructor(private _httpClient: HttpClient, private _exportService: ExportService) {}

  private createParams(tableRequest: TableRequestData): HttpParams {
    const params: { [key: string]: string | number | boolean } = {};
    params['draw'] = tableRequest.draw;
    params['start'] = tableRequest.start;
    params['length'] = tableRequest.length;
    params['search[value]'] = tableRequest.search.value;
    params['search[regex]'] = tableRequest.search.regex;
    if (tableRequest.filter) {
      params['filter'] = tableRequest.filter;
    }
    if (tableRequest.params) {
      params['params'] = JSON.stringify(tableRequest.params);
    }

    tableRequest.columns.forEach((col, i) => {
      const prefix = `columns[${i}]`;
      if (col.data) params[`${prefix}[data]`] = col.data;
      params[`${prefix}[name]`] = col.name;
      if (col.searchable !== undefined) params[`${prefix}[searchable]`] = col.searchable;
      if (col.orderable !== undefined) params[`${prefix}[orderable]`] = col.orderable;
      if (col.search) {
        params[`${prefix}[search][value]`] = col.search.value;
        params[`${prefix}[search][regex]`] = col.search.regex;
      }
    });

    tableRequest.order.forEach((ord, i) => {
      const prefix = `order[${i}]`;
      params[`${prefix}[column]`] = ord.column;
      params[`${prefix}[dir]`] = ord.dir;
    });

    return new HttpParams({ fromObject: params });
  }

  requestTable(tableId: string, tableRequest: TableRequestData): Observable<TableResponse> {
    const url = `${ROOT}/${tableId}/data`;
    const params = this.createParams(tableRequest);
    return this._httpClient.post<TableResponse>(url, params);
  }

  requestColumnValues(tableId: string, columnName: string): Observable<string[]> {
    const url = `${ROOT}/${tableId}/column/${columnName}/distinct`;
    return this._httpClient.get<string[]>(url);
  }

  getExportUrl(tableId: string, params?: unknown): string {
    let url = `${ROOT}/${tableId}/export`;
    if (params) {
      url = `${url}?params=${encodeURIComponent(JSON.stringify(params))}`;
    }
    return url;
  }

  exportAsCSV(tableId: string, params?: unknown): void {
    const url = this.getExportUrl(tableId, params);
    this._httpClient
      .get<{ exportID: string }>(url)
      .pipe(map(({ exportID }) => `${ROOT}/exports/${exportID}`))
      .subscribe((pollUrl) => this._exportService.pollUrl(pollUrl));
  }
}
