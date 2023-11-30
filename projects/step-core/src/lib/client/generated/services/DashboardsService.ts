/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { DashboardView } from '../models/DashboardView';
import type { History } from '../models/History';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseDashboardView } from '../models/TableResponseDashboardView';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class DashboardsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deleteEntityS5(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns DashboardView default response
   * @throws ApiError
   */
  public cloneEntity5(id: string): Observable<DashboardView> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/dashboards/{id}/clone',
      path: {
        id: id,
      },
    });
  }

  /**
   * Clones the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public cloneEntityS5(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves an entity by its Id
   * @param id
   * @returns DashboardView default response
   * @throws ApiError
   */
  public getEntityById5(id: string): Observable<DashboardView> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/dashboards/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Deletes the entity with the given Id
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public deleteEntity5(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/dashboards/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the list of entities for the provided list of IDs
   * @param requestBody
   * @returns DashboardView default response
   * @throws ApiError
   */
  public findEntitySByIds5(requestBody?: Array<string>): Observable<Array<DashboardView>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/find/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns DashboardView default response
   * @throws ApiError
   */
  public findEntitySByAttributes5(requestBody?: Record<string, string>): Observable<Array<DashboardView>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/find',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns DashboardView default response
   * @throws ApiError
   */
  public getAll1(): Observable<Array<DashboardView>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/dashboards',
    });
  }

  /**
   * Saves the provided entity
   * @param requestBody
   * @returns DashboardView default response
   * @throws ApiError
   */
  public saveEntity5(requestBody?: DashboardView): Observable<DashboardView> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves the versions of the entity with the given id
   * @param id
   * @returns History default response
   * @throws ApiError
   */
  public getEntityVersions5(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/dashboards/{id}/versions',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get the table view according to provided request
   * @param requestBody
   * @returns TableResponseDashboardView default response
   * @throws ApiError
   */
  public getEntityTable5(requestBody?: TableRequest): Observable<TableResponseDashboardView> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Restore a version of this entity
   * @param id
   * @param versionId
   * @returns DashboardView default response
   * @throws ApiError
   */
  public restoreEntityVersion5(id: string, versionId: string): Observable<DashboardView> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/{id}/restore/{versionId}',
      path: {
        id: id,
        versionId: versionId,
      },
    });
  }
}
