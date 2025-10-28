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
import type { RefreshResourceResult } from '../models/RefreshResourceResult';
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
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public bulkDeleteAutomationPackageResource(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/resources/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public bulkRefresh(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/bulk/refresh',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public bulkRefreshAutomationPackageResource(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/resources/bulk/refresh',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param formData
   * @returns any default response
   * @throws ApiError
   */
  public createOrUpdateAutomationPackage(formData?: {
    async?: boolean;
    versionName?: string;
    forceRefreshOfSnapshots?: boolean;
    activationExpr?: string;
    file?: FormDataContentDisposition;
    apMavenSnippet?: string;
    apLibrary?: FormDataContentDisposition;
    apLibraryMavenSnippet?: string;
    apResourceId?: string;
    apLibraryResourceId?: string;
    managedLibraryName?: string;
    plansAttributes?: string;
    functionsAttributes?: string;
    tokenSelectionCriteria?: string;
    executeFunctionsLocally?: boolean;
  }): Observable<any> {
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
  public createAutomationPackage(formData?: {
    versionName?: string;
    activationExpr?: string;
    forceRefreshOfSnapshots?: boolean;
    file?: FormDataContentDisposition;
    apMavenSnippet?: string;
    apResourceId?: string;
    apLibrary?: FormDataContentDisposition;
    apLibraryMavenSnippet?: string;
    apLibraryResourceId?: string;
    managedLibraryName?: string;
    plansAttributes?: string;
    functionsAttributes?: string;
    tokenSelectionCriteria?: string;
    executeFunctionsLocally?: boolean;
  }): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
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
  public createNewAutomationPackageResource(formData?: {
    resourceType?: string;
    file?: FormDataContentDisposition;
    mavenSnippet?: string;
    managedLibraryName?: string;
  }): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/resources',
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
   * @param formData
   * @returns AutomationPackageUpdateResult default response
   * @throws ApiError
   */
  public updateAutomationPackage(
    id: string,
    formData?: {
      async?: boolean;
      versionName?: string;
      activationExpr?: string;
      forceRefreshOfSnapshots?: boolean;
      file?: FormDataContentDisposition;
      apMavenSnippet?: string;
      apLibrary?: FormDataContentDisposition;
      apLibraryMavenSnippet?: string;
      apResourceId?: string;
      apLibraryResourceId?: string;
      managedLibraryName?: string;
      plansAttributes?: string;
      functionsAttributes?: string;
      tokenSelectionCriteria?: string;
      executeFunctionsLocally?: boolean;
    },
  ): Observable<AutomationPackageUpdateResult> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/automation-packages/{id}',
      path: {
        id: id,
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
   * @param id
   * @param formData
   * @returns string default response
   * @throws ApiError
   */
  public updateAutomationPackageResource(
    id: string,
    formData?: {
      file?: FormDataContentDisposition;
      mavenSnippet?: string;
      newManagedLibraryName?: string;
    },
  ): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/resources/{id}',
      path: {
        id: id,
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
  public deleteAutomationPackageResource(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/automation-packages/resources/{id}',
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
    apResourceId?: string;
    apLibrary?: FormDataContentDisposition;
    apLibraryMavenSnippet?: string;
    apLibraryResourceId?: string;
    managedLibraryName?: string;
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
   * @returns AutomationPackage default response
   * @throws ApiError
   */
  public getLinkedAutomationPackagesForResource(id: string): Observable<Array<AutomationPackage>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/automation-packages/resources/{id}/automation-packages',
      path: {
        id: id,
      },
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
   * @returns RefreshResourceResult default response
   * @throws ApiError
   */
  public refreshAutomationPackage(id: string): Observable<RefreshResourceResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/{id}/refresh',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @returns RefreshResourceResult default response
   * @throws ApiError
   */
  public refreshAutomationPackageResource(id: string): Observable<RefreshResourceResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/automation-packages/resources/{id}/refresh',
      path: {
        id: id,
      },
    });
  }
}
