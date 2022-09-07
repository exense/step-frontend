/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import type { ChangePasswordResponse } from '../models/ChangePasswordResponse';
import type { Password } from '../models/Password';
import type { PasswordPolicyDescriptor } from '../models/PasswordPolicyDescriptor';
import type { Preferences } from '../models/Preferences';
import type { User } from '../models/User';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns ChangePasswordResponse default response
   * @throws ApiError
   */
  public changePassword(requestBody?: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/myaccount/changepwd',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns string default response
   * @throws ApiError
   */
  public getMaintenanceMessage(): Observable<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/admin/maintenance/message',
    });
  }

  /**
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public setMaintenanceMessage(requestBody?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/maintenance/message',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns boolean default response
   * @throws ApiError
   */
  public getMaintenanceMessageToggle(): Observable<boolean> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/admin/maintenance/message/toggle',
    });
  }

  /**
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public setMaintenanceMessageToggle(requestBody?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/maintenance/message/toggle',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

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
   * @returns PasswordPolicyDescriptor default response
   * @throws ApiError
   */
  public getPasswordPolicies(): Observable<Array<PasswordPolicyDescriptor>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/admin/security/passwordpolicies',
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
   * @returns User default response
   * @throws ApiError
   */
  public getUser(id: string): Observable<User> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/admin/user/{id}',
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
  public removeUser(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/admin/user/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * @returns User default response
   * @throws ApiError
   */
  public getUserList(): Observable<Array<User>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/admin/users',
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

  /**
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public resetAdminPassword(requestBody?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/serviceaccount/resetpwd',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @returns Password default response
   * @throws ApiError
   */
  public resetPassword(id: string): Observable<Password> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/user/{id}/resetpwd',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public saveUser(requestBody?: User): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/admin/user',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
