/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class EntitiesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param type
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public getEntity(type: string, id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/entities/{type}/{id}',
      path: {
        type: type,
        id: id,
      },
    });
  }

  /**
   * @param type
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public deleteEntity(type: string, id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/entities/{type}/{id}',
      path: {
        type: type,
        id: id,
      },
    });
  }

  /**
   * @param type
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public findEntity(type: string, requestBody?: Record<string, string>): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/entities/{type}/find',
      path: {
        type: type,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param type
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public saveEntity(type: string, requestBody?: any): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/entities/{type}',
      path: {
        type: type,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
