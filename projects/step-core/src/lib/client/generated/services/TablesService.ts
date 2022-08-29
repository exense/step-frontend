/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ExportStatus } from '../models/ExportStatus';
import type { TableExportRequest } from '../models/TableExportRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseObject } from '../models/TableResponseObject';
import type { WebPlugin } from '../models/WebPlugin';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class TablesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param tableName
   * @param requestBody
   * @returns ExportStatus default response
   * @throws ApiError
   */
  public createExport(tableName: string, requestBody?: TableExportRequest): Observable<ExportStatus> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/table/{tableName}/export',
      path: {
        tableName: tableName,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns WebPlugin default response
   * @throws ApiError
   */
  public getWebPlugins1(): Observable<Array<WebPlugin>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/table/plugins',
    });
  }

  /**
   * @param tableName
   * @param requestBody
   * @returns TableResponseObject default response
   * @throws ApiError
   */
  public request(tableName: string, requestBody?: TableRequest): Observable<TableResponseObject> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/table/{tableName}',
      path: {
        tableName: tableName,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
