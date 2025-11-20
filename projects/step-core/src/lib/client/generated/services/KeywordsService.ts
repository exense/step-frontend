/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { CallFunction } from '../models/CallFunction';
import type { Function } from '../models/Function';
import type { FunctionInputJsonObject } from '../models/FunctionInputJsonObject';
import type { GetTokenHandleParameter } from '../models/GetTokenHandleParameter';
import type { History } from '../models/History';
import type { LookupCallFunctionRequest } from '../models/LookupCallFunctionRequest';
import type { OutputJsonObject } from '../models/OutputJsonObject';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseFunction } from '../models/TableResponseFunction';
import type { TokenWrapper } from '../models/TokenWrapper';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class KeywordsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deleteFunctions(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns OutputJsonObject default response
   * @throws ApiError
   */
  public callFunctionByAttributes(id: string, requestBody?: FunctionInputJsonObject): Observable<OutputJsonObject> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/executor/tokens/{id}/execute',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @param functionId
   * @param requestBody
   * @returns OutputJsonObject default response
   * @throws ApiError
   */
  public callFunctionById(
    id: string,
    functionId: string,
    requestBody?: FunctionInputJsonObject,
  ): Observable<OutputJsonObject> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/executor/tokens/{id}/execute/{functionId}',
      path: {
        id: id,
        functionId: functionId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns Function default response
   * @throws ApiError
   */
  public cloneFunction(id: string): Observable<Function> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/{id}/clone',
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
  public cloneFunctions(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves an entity by its Id
   * @param id
   * @returns Function default response
   * @throws ApiError
   */
  public getFunctionById(id: string): Observable<Function> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/{id}',
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
  public deleteFunction(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/functions/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the list of entities for the provided list of IDs
   * @param requestBody
   * @returns Function default response
   * @throws ApiError
   */
  public findFunctionsByIds(requestBody?: Array<string>): Observable<Array<Function>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/find/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns Function default response
   * @throws ApiError
   */
  public findFunctionsByAttributes(requestBody?: Record<string, string>): Observable<Array<Function>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/find',
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
  public findFunctionNamesByIds(requestBody?: Array<string>): Observable<Record<string, string>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/find/names/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param skip
   * @param limit
   * @returns Function default response
   * @throws ApiError
   */
  public getAllFunctions(skip?: number, limit?: number): Observable<Array<Function>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions',
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * Saves the provided entity
   * @param requestBody
   * @returns Function default response
   * @throws ApiError
   */
  public saveFunction(requestBody?: Function): Observable<Function> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @returns string default response
   * @throws ApiError
   */
  public getFunctionEditor(id: string): Observable<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/{id}/editor',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param requestBody
   * @returns TokenWrapper default response
   * @throws ApiError
   */
  public getFunctionTokenHandle(requestBody?: GetTokenHandleParameter): Observable<TokenWrapper> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/executor/tokens/select',
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
  public getFunctionVersions(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/{id}/versions',
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
  public isFunctionLocked(id: string): Observable<boolean> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/{id}/locked',
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
  public lockFunction(id: string, requestBody?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/{id}/locked',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns Function default response
   * @throws ApiError
   */
  public lookupCallFunction(requestBody?: CallFunction): Observable<Function> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/lookup',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns Function default response
   * @throws ApiError
   */
  public lookupCallFunctionWithBindings(requestBody?: LookupCallFunctionRequest): Observable<Function> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/lookup-with-bindings',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @returns Function default response
   * @throws ApiError
   */
  public newFunctionTypeConf(id: string): Observable<Function> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/types/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get the table view according to provided request
   * @param requestBody
   * @returns TableResponseFunction default response
   * @throws ApiError
   */
  public getFunctionTable(requestBody?: TableRequest): Observable<TableResponseFunction> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Restore a version of this entity
   * @param id
   * @param versionId
   * @returns Function default response
   * @throws ApiError
   */
  public restoreFunctionVersion(id: string, versionId: string): Observable<Function> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/{id}/restore/{versionId}',
      path: {
        id: id,
        versionId: versionId,
      },
    });
  }

  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public returnFunctionTokenHandle(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/executor/tokens/{id}/return',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param requestBody
   * @returns Function default response
   * @throws ApiError
   */
  public searchFunction(requestBody?: Record<string, string>): Observable<Function> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/search',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
