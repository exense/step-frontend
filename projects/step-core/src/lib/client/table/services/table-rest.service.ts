import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableRequestData } from '../models/table-request-data';
import { TableResponse } from '../models/table-response';
import { Observable } from 'rxjs';

const ROOT = 'rest/table';

@Injectable({
  providedIn: 'root',
})
export class TableRestService {
  constructor(private _httpClient: HttpClient) {}

  requestTable<T>(tableId: string, tableRequest: TableRequestData): Observable<TableResponse<T>> {
    const url = `${ROOT}/${tableId}`;
    return this._httpClient.post<TableResponse<T>>(url, tableRequest);
  }

  requestColumnValues(tableId: string, columnName: string): Observable<string[]> {
    const url = `${ROOT}/${tableId}/column/${columnName}/distinct`;
    return this._httpClient.get<string[]>(url);
  }
}
