/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AutomationPackageUpdateResult } from '../../generated';
import type { AutomationPackageDescriptor } from '../models/AutomationPackageDescriptor';
import type { RemoteDefaults } from '../models/RemoteDefaults';
import type { RemoteDeploymentRequest } from '../models/RemoteDeploymentRequest';
import type { RemoteExecution } from '../models/RemoteExecution';
import type { RemoteExecutionRequest } from '../models/RemoteExecutionRequest';

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
   * @param requestBody
   * @returns AutomationPackageUpdateResult default response
   * @throws ApiError
   */
  public deployRemote(requestBody?: RemoteDeploymentRequest): Observable<AutomationPackageUpdateResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/remote-deploy',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns RemoteExecution default response
   * @throws ApiError
   */
  public executeRemote(requestBody?: RemoteExecutionRequest): Observable<Array<RemoteExecution>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/remote-execute',
      body: requestBody,
      mediaType: 'application/json',
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
   * @returns RemoteDefaults default response
   * @throws ApiError
   */
  public getRemoteDefaults(): Observable<RemoteDefaults> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/remote-defaults',
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
      url: '/local/ide/ap/initialize-new',
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
      url: '/local/ide/ap/use-existing',
      query: {
        directory: directory,
      },
    });
  }
}
