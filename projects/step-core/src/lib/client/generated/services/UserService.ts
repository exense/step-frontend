/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Preferences } from '../models/Preferences';
import type { User } from '../models/User';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns User default response
   * @throws ApiError
   */
  public getMyUser(): Observable<User> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/admin/myaccount',
    });
  }

  /**
   * @returns Preferences default response
   * @throws ApiError
   */
  public getPreferences(): Observable<Preferences> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/admin/myaccount/preferences',
    });
  }

  /**
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public putPreferences(requestBody?: Preferences): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/myaccount/preferences',
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
  public putPreference(id: string, requestBody?: any): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/myaccount/preferences/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
