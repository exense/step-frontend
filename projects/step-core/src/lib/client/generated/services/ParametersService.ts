/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { History } from '../models/History';
import type { Parameter } from '../models/Parameter';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseParameter } from '../models/TableResponseParameter';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ParametersService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deleteParameters(
    requestBody?: TableBulkOperationRequest
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/parameters/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns Parameter default response
   * @throws ApiError
   */
  public cloneParameter(id: string): Observable<Parameter> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/parameters/{id}/clone',
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
  public cloneParameters(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/parameters/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves an entity by its Id
   * @param id
   * @returns Parameter default response
   * @throws ApiError
   */
  public getParameterById(id: string): Observable<Parameter> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/parameters/{id}',
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
  public deleteParameter(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/parameters/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns Parameter default response
   * @throws ApiError
   */
  public findParametersByAttributes(requestBody?: Record<string, string>): Observable<Array<Parameter>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/parameters/find',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param skip
   * @param limit
   * @returns Parameter default response
   * @throws ApiError
   */
  public getAllParameters(skip?: number, limit?: number): Observable<Array<Parameter>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/parameters/all',
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * Retrieves entity's versioned
   * @param id
   * @returns History default response
   * @throws ApiError
   */
  public getParameterHistory(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/parameters/{id}/history',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param requestBody
   * @returns Parameter default response
   * @throws ApiError
   */
  public getParameterByAttributes(requestBody?: Record<string, string>): Observable<Parameter> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/parameters/search',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns Parameter default response
   * @throws ApiError
   */
  public newParameter(): Observable<Parameter> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/parameters',
    });
  }

  /**
   * Saves the provided entity
   * @param requestBody
   * @returns Parameter default response
   * @throws ApiError
   */
  public saveParameter(requestBody?: Parameter): Observable<Parameter> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/parameters',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get the table view according to provided request
   * @param requestBody
   * @returns TableResponseParameter default response
   * @throws ApiError
   */
  public getParameterTable(requestBody?: TableRequest): Observable<TableResponseParameter> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/parameters/table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Restore a version of this entity
   * @param id
   * @param versionId
   * @returns Parameter default response
   * @throws ApiError
   */
  public restoreParameterVersion(id: string, versionId: string): Observable<Parameter> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/parameters/{id}/restore/{versionId}',
      path: {
        id: id,
        versionId: versionId,
      },
    });
  }
}
