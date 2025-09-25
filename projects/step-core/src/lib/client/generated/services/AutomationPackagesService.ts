/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AbstractOrganizableObject } from '../models/AbstractOrganizableObject';
import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { AutomationPackage } from '../models/AutomationPackage';
import type { AutomationPackageExecutionParameters } from '../models/AutomationPackageExecutionParameters';
import type { AutomationPackageUpdateResult } from '../models/AutomationPackageUpdateResult';
import type { FormDataBodyPart } from '../models/FormDataBodyPart';
import type { FormDataContentDisposition } from '../models/FormDataContentDisposition';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class AutomationPackagesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public bulkDelete(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param async
   * @param version
   * @param allowUpdateOfOtherPackages
   * @param activationExpr
   * @param formData
   * @returns any default response
   * @throws ApiError
   */
  public createOrUpdateAutomationPackage(
    async?: boolean,
    version?: string,
    allowUpdateOfOtherPackages?: boolean,
    activationExpr?: string,
    formData?: {
      file?: FormDataContentDisposition;
      apMavenSnippet?: string;
      keywordLibrary?: FormDataContentDisposition;
      keywordLibraryMavenSnippet?: string;
      apResourceId?: string;
      keywordLibraryResourceId?: string;
    },
  ): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/automation-packages',
      query: {
        async: async,
        version: version,
        allowUpdateOfOtherPackages: allowUpdateOfOtherPackages,
        activationExpr: activationExpr,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param version
   * @param activationExpr
   * @param allowUpdateOfOtherPackages
   * @param formData
   * @returns string default response
   * @throws ApiError
   */
  public createAutomationPackage(
    version?: string,
    activationExpr?: string,
    allowUpdateOfOtherPackages?: boolean,
    formData?: {
      file?: FormDataContentDisposition;
      apMavenSnippet?: string;
      keywordLibrary?: FormDataContentDisposition;
      keywordLibraryMavenSnippet?: string;
      apResourceId?: string;
      keywordLibraryResourceId?: string;
    },
  ): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages',
      query: {
        version: version,
        activationExpr: activationExpr,
        allowUpdateOfOtherPackages: allowUpdateOfOtherPackages,
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
   * @param allowUpdateOfOtherPackages
   * @param formData
   * @returns AutomationPackageUpdateResult default response
   * @throws ApiError
   */
  public updateAutomationPackage(
    id: string,
    async?: boolean,
    version?: string,
    activationExpr?: string,
    allowUpdateOfOtherPackages?: boolean,
    formData?: {
      file?: FormDataContentDisposition;
      apMavenSnippet?: string;
      keywordLibrary?: FormDataContentDisposition;
      keywordLibraryMavenSnippet?: string;
      apResourceId?: string;
      keywordLibraryResourceId?: string;
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
        allowUpdateOfOtherPackages: allowUpdateOfOtherPackages,
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
    apMavenSnippet?: string;
    keywordLibrary?: FormDataContentDisposition;
    executionParams?: FormDataBodyPart;
    keywordLibraryMavenSnippet?: string;
    apResourceId?: string;
    keywordLibraryResourceId?: string;
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
   * @returns AbstractOrganizableObject default response
   * @throws ApiError
   */
  public listEntities(id: string): Observable<Record<string, Array<AbstractOrganizableObject>>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/automation-packages/{id}/entities',
      path: {
        id: id,
      },
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
