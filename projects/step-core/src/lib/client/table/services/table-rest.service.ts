import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TableRequestData } from '../models/table-request-data';
import { TableResponse } from '../models/table-response';
import { Observable } from 'rxjs';

const ROOT = 'rest/table';

@Injectable({
  providedIn: 'root',
})
export class TableRestService {
  constructor(private _httpClient: HttpClient) {}

  private createParams(tableRequest: TableRequestData): HttpParams {
    const params: { [key: string]: string | number | boolean } = {};
    params['draw'] = tableRequest.draw;
    params['start'] = tableRequest.start;
    params['length'] = tableRequest.length;
    params['search[value]'] = tableRequest.search.value;
    params['search[regex]'] = tableRequest.search.regex;

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
}
