/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { CountRequest } from '../models/CountRequest';
import type { Filter } from '../models/Filter';
import type { FindRequest } from '../models/FindRequest';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class CollectionsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public count(id: string, requestBody?: CountRequest): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/remote/{id}/count',
      path: {
        id: id,
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
  public countEstimated(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/remote/{id}/count/estimated',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public delete(id: string, requestBody?: Filter): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/remote/{id}/remove',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @param columnName
   * @param requestBody
   * @returns string default response
   * @throws ApiError
   */
  public distinctPost(id: string, columnName: string, requestBody?: Filter): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/remote/{id}/distinct/{columnName}',
      path: {
        id: id,
        columnName: columnName,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public find(id: string, requestBody?: FindRequest): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/remote/{id}/find',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public save(id: string, requestBody?: any): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/remote/{id}/save',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public saveBulk(id: string, requestBody?: Array<any>): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/remote/{id}/saveMany',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
