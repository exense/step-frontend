/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AutomationPackage } from '../models/AutomationPackage';
import type { AutomationPackageExecutionParameters } from '../models/AutomationPackageExecutionParameters';
import type { AutomationPackageUpdateResult } from '../models/AutomationPackageUpdateResult';
import type { FormDataBodyPart } from '../models/FormDataBodyPart';
import type { FormDataContentDisposition } from '../models/FormDataContentDisposition';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class AutomationPackagesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param async
   * @param version
   * @param activationExpr
   * @param formData
   * @returns any default response
   * @throws ApiError
   */
  public createOrUpdateAutomationPackage(
    async?: boolean,
    version?: string,
    activationExpr?: string,
    formData?: {
      file?: FormDataContentDisposition;
    },
  ): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/automation-packages',
      query: {
        async: async,
        version: version,
        activationExpr: activationExpr,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param version
   * @param activationExpr
   * @param formData
   * @returns string default response
   * @throws ApiError
   */
  public createAutomationPackage(
    version?: string,
    activationExpr?: string,
    formData?: {
      file?: FormDataContentDisposition;
    },
  ): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages',
      query: {
        version: version,
        activationExpr: activationExpr,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param id
   * @returns AutomationPackage default response
   * @throws ApiError
   */
  public getAutomationPackage(id: string): Observable<AutomationPackage> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/automation-packages/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @param async
   * @param version
   * @param activationExpr
   * @param formData
   * @returns AutomationPackageUpdateResult default response
   * @throws ApiError
   */
  public updateAutomationPackageMetadata1(
    id: string,
    async?: boolean,
    version?: string,
    activationExpr?: string,
    formData?: {
      file?: FormDataContentDisposition;
    },
  ): Observable<AutomationPackageUpdateResult> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/automation-packages/{id}',
      path: {
        id: id,
      },
      query: {
        async: async,
        version: version,
        activationExpr: activationExpr,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public deleteAutomationPackage(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/automation-packages/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param formData
   * @returns string default response
   * @throws ApiError
   */
  public executeAutomationPackage(formData?: {
    file?: FormDataContentDisposition;
    executionParams?: FormDataBodyPart;
  }): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/execute',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns string default response
   * @throws ApiError
   */
  public executeDeployedAutomationPackage(
    id: string,
    requestBody?: AutomationPackageExecutionParameters,
  ): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/execute/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns string default response
   * @throws ApiError
   */
  public getAutomationPackageDescriptorSchema(): Observable<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/automation-packages/schema',
    });
  }

  /**
   * @param id
   * @param activationExpr
   * @param version
   * @returns any default response
   * @throws ApiError
   */
  public updateAutomationPackageMetadata(id: string, activationExpr?: string, version?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/automation-packages/{id}/metadata',
      path: {
        id: id,
      },
      query: {
        activationExpr: activationExpr,
        version: version,
      },
    });
  }
}
