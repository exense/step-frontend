/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { History } from '../models/History';
import type { ReportLayout } from '../models/ReportLayout';
import type { ReportLayoutJson } from '../models/ReportLayoutJson';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseReportLayout } from '../models/TableResponseReportLayout';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ReportLayoutService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deleteReportLayouts(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns ReportLayout default response
   * @throws ApiError
   */
  public cloneReportLayout(id: string): Observable<ReportLayout> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/report-layout/{id}/clone',
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
  public cloneReportLayouts(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves an entity by its Id
   * @param id
   * @returns ReportLayout default response
   * @throws ApiError
   */
  public getReportLayoutById(id: string): Observable<ReportLayout> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/report-layout/{id}',
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
  public deleteReportLayout(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/report-layout/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Export the report layout to its Json representation
   * @param id
   * @returns ReportLayoutJson default response
   * @throws ApiError
   */
  public exportLayout(id: string): Observable<ReportLayoutJson> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/report-layout/{id}/json',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the list of entities for the provided list of IDs
   * @param requestBody
   * @returns ReportLayout default response
   * @throws ApiError
   */
  public findReportLayoutsByIds(requestBody?: Array<string>): Observable<Array<ReportLayout>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/find/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns ReportLayout default response
   * @throws ApiError
   */
  public findReportLayoutsByAttributes(requestBody?: Record<string, string>): Observable<Array<ReportLayout>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/find',
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
  public findReportLayoutNamesByIds(requestBody?: Array<string>): Observable<Record<string, string>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/find/names/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns all accessible report layouts.
   * @returns ReportLayout default response
   * @throws ApiError
   */
  public getAllReportLayouts(): Observable<Array<ReportLayout>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/report-layout/list',
    });
  }

  /**
   * Retrieves the versions of the entity with the given id
   * @param id
   * @returns History default response
   * @throws ApiError
   */
  public getReportLayoutVersions(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/report-layout/{id}/versions',
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
  public isReportLayoutLocked(id: string): Observable<boolean> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/report-layout/{id}/locked',
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
  public lockReportLayout(id: string, requestBody?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/{id}/locked',
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
   * @returns TableResponseReportLayout default response
   * @throws ApiError
   */
  public getReportLayoutTable(requestBody?: TableRequest): Observable<TableResponseReportLayout> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Restore a version of this entity
   * @param id
   * @param versionId
   * @returns ReportLayout default response
   * @throws ApiError
   */
  public restoreReportLayoutVersion(id: string, versionId: string): Observable<ReportLayout> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/{id}/restore/{versionId}',
      path: {
        id: id,
        versionId: versionId,
      },
    });
  }

  /**
   * Saves the provided entity
   * @param requestBody
   * @returns ReportLayout default response
   * @throws ApiError
   */
  public saveReportLayout(requestBody?: ReportLayout): Observable<ReportLayout> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Share this report layout with other users
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public shareReportLayout(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/{id}/share',
      path: {
        id: id,
      },
    });
  }

  /**
   * Unshare this report layout
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public unshareReportLayout(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/report-layout/{id}/unshare',
      path: {
        id: id,
      },
    });
  }
}
