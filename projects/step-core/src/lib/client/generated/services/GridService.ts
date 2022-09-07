/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AgentListEntry } from '../models/AgentListEntry';
import type { TokenGroupCapacity } from '../models/TokenGroupCapacity';
import type { TokenWrapper } from '../models/TokenWrapper';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class GridService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param notokens
   * @returns AgentListEntry default response
   * @throws ApiError
   */
  public getAgents(notokens?: string): Observable<Array<AgentListEntry>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/grid/agent',
      query: {
        notokens: notokens,
      },
    });
  }

  /**
   * @returns TokenWrapper default response
   * @throws ApiError
   */
  public getTokenAssociations(): Observable<Array<TokenWrapper>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/grid/token',
    });
  }

  /**
   * @returns string default response
   * @throws ApiError
   */
  public getTokenAttributeKeys(): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/grid/keys',
    });
  }

  /**
   * @param groupby
   * @returns TokenGroupCapacity default response
   * @throws ApiError
   */
  public getUsageByIdentity(groupby?: Array<string>): Observable<Array<TokenGroupCapacity>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/grid/token/usage',
      query: {
        groupby: groupby,
      },
    });
  }

  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public interruptAgent(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/grid/agent/{id}/interrupt',
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
  public removeAgentTokenErrors(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/grid/agent/{id}/tokens/errors',
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
  public removeTokenError(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/grid/token/{id}/error',
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
  public resumeAgent(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/grid/agent/{id}/resume',
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
  public startTokenMaintenance(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/grid/token/{id}/maintenance',
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
  public stopTokenMaintenance(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/grid/token/{id}/maintenance',
      path: {
        id: id,
      },
    });
  }
}
