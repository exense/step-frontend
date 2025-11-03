/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusResource } from '../models/AsyncTaskStatusResource';
import type { TableExportRequest } from '../models/TableExportRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseObject } from '../models/TableResponseObject';
import type { TableSettings } from '../models/TableSettings';
import type { TableSettingsRequest } from '../models/TableSettingsRequest';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
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
   * @param tableName
   * @returns TableSettings default response
   * @throws ApiError
   */
  public getTableSettings(tableName: string): Observable<TableSettings> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/table/{tableName}/settings',
      path: {
        tableName: tableName,
      },
    });
  }

  /**
   * @param tableName
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public saveTableSettings(tableName: string, requestBody?: TableSettingsRequest): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/table/{tableName}/settings',
      path: {
        tableName: tableName,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param tableName
   * @param includeGlobalEntities
   * @param requestBody
   * @returns TableResponseObject default response
   * @throws ApiError
   */
  public request(
    tableName: string,
    includeGlobalEntities: boolean = true,
    requestBody?: TableRequest,
  ): Observable<TableResponseObject> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/table/{tableName}',
      path: {
        tableName: tableName,
      },
      query: {
        includeGlobalEntities: includeGlobalEntities,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
