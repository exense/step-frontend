/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AutomationPackage } from '../models/AutomationPackage';
import type { FormDataContentDisposition } from '../models/FormDataContentDisposition';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class AutomationPackagesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param formData
   * @returns any default response
   * @throws ApiError
   */
  public updateAutomationPackage(formData?: { file?: FormDataContentDisposition }): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/automation-packages',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param formData
   * @returns string default response
   * @throws ApiError
   */
  public createAutomationPackage(formData?: { file?: FormDataContentDisposition }): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param name
   * @returns AutomationPackage default response
   * @throws ApiError
   */
  public getAutomationPackage(name: string): Observable<AutomationPackage> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/automation-packages/{name}',
      path: {
        name: name,
      },
    });
  }

  /**
   * @param name
   * @returns any default response
   * @throws ApiError
   */
  public deleteAutomationPackage(name: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/automation-packages/{name}',
      path: {
        name: name,
      },
    });
  }
}
