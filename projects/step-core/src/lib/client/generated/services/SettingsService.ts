/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @returns string default response
   * @throws ApiError
   */
  public getSetting(id: string): Observable<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/settings/{id}',
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
  public saveSetting(id: string, requestBody?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/settings/{id}',
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
  public deleteSetting(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/settings/{id}',
      path: {
        id: id,
      },
    });
  }
}
