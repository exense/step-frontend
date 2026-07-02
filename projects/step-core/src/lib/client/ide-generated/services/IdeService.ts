/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AutomationPackageDescriptor } from '../models/AutomationPackageDescriptor';

import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class IdeService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns any default response
   * @throws ApiError
   */
  public closeAp(): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/close',
    });
  }

  /**
   * @returns AutomationPackageDescriptor default response
   * @throws ApiError
   */
  public getCurrentAp(): Observable<AutomationPackageDescriptor> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/ap/current',
    });
  }

  /**
   * @param existingEmptyDirectory
   * @param apName
   * @returns any default response
   * @throws ApiError
   */
  public initializeNewAp(existingEmptyDirectory?: string, apName?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/initializeNew',
      query: {
        existingEmptyDirectory: existingEmptyDirectory,
        apName: apName,
      },
    });
  }

  /**
   * @param directory
   * @returns any default response
   * @throws ApiError
   */
  public useExistingAp(directory?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/useExisting',
      query: {
        directory: directory,
      },
    });
  }
}
