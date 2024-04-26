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
  public deleteDashboards(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
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
  public cloneDashboard(id: string): Observable<DashboardView> {
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
  public cloneDashboards(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
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
  public getDashboardById(id: string): Observable<DashboardView> {
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
  public deleteDashboard(id: string): Observable<any> {
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
  public findDashboardsByIds(requestBody?: Array<string>): Observable<Array<DashboardView>> {
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
  public findDashboardsByAttributes(requestBody?: Record<string, string>): Observable<Array<DashboardView>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/find',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the map of entities IDs to names for the provided list of IDs
   * @param requestBody
   * @returns string default response
   * @throws ApiError
   */
  public findDashboardNamesByIds(requestBody?: Array<string>): Observable<Record<string, string>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/find/names/by/ids',
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
  public saveDashboard(requestBody?: DashboardView): Observable<DashboardView> {
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
  public getDashboardVersions(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/dashboards/{id}/versions',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get entity locking state
   * @param id
   * @returns boolean default response
   * @throws ApiError
   */
  public isDashboardLocked(id: string): Observable<boolean> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/dashboards/{id}/locked',
      path: {
        id: id,
      },
    });
  }

  /**
   * Lock this entity
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public lockDashboard(id: string, requestBody?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/dashboards/{id}/locked',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get the table view according to provided request
   * @param requestBody
   * @returns TableResponseDashboardView default response
   * @throws ApiError
   */
  public getDashboardTable(requestBody?: TableRequest): Observable<TableResponseDashboardView> {
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
  public restoreDashboardVersion(id: string, versionId: string): Observable<DashboardView> {
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
