/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusResource } from '../models/AsyncTaskStatusResource';
import type { TableExportRequest } from '../models/TableExportRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseObject } from '../models/TableResponseObject';
import type { WebPlugin } from '../models/WebPlugin';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class TablesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param tableName
   * @param requestBody
   * @returns AsyncTaskStatusResource default response
   * @throws ApiError
   */
  public createExport(tableName: string, requestBody?: TableExportRequest): Observable<AsyncTaskStatusResource> {
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
