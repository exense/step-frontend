/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { CallFunction } from '../models/CallFunction';
import type { Function } from '../models/Function';
import type { FunctionInputJsonObject } from '../models/FunctionInputJsonObject';
import type { GetTokenHandleParameter } from '../models/GetTokenHandleParameter';
import type { OutputJsonObject } from '../models/OutputJsonObject';
import type { TokenWrapper } from '../models/TokenWrapper';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class KeywordsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

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
    requestBody?: FunctionInputJsonObject
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
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public copyFunction(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/{id}/copy',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @returns Function default response
   * @throws ApiError
   */
  public getFunction(id: string): Observable<Function> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
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
   * @param requestBody
   * @returns Function default response
   * @throws ApiError
   */
  public findMany(requestBody?: Record<string, string>): Observable<Array<Function>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/find',
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
  public getTokenHandle(requestBody?: GetTokenHandleParameter): Observable<TokenWrapper> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/functions/executor/tokens/select',
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
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public returnTokenHandle(id: string): Observable<any> {
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
