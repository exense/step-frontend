/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { DockerRegistryConfiguration } from '../models/DockerRegistryConfiguration';
import type { History } from '../models/History';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseDockerRegistryConfiguration } from '../models/TableResponseDockerRegistryConfiguration';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class DockerRegistriesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deleteDockerRegistrys(
    requestBody?: TableBulkOperationRequest
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public cloneDockerRegistry(id: string): Observable<DockerRegistryConfiguration> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docker/registry/{id}/clone',
      path: {
        id: id,
      },
    });
  }

  /**
   * Clones the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public cloneDockerRegistrys(
    requestBody?: TableBulkOperationRequest
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves an entity by its Id
   * @param id
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public getDockerRegistryById(id: string): Observable<DockerRegistryConfiguration> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docker/registry/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Deletes the entity with the given Id
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public deleteDockerRegistry(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/docker/registry/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the list of entities for the provided list of IDs
   * @param requestBody
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public findDockerRegistrysByIds(requestBody?: Array<string>): Observable<Array<DockerRegistryConfiguration>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry/find/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public findDockerRegistrysByAttributes(
    requestBody?: Record<string, string>
  ): Observable<Array<DockerRegistryConfiguration>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry/find',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves all the entities
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public listDockerRegistry(): Observable<Array<DockerRegistryConfiguration>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docker/registry/list',
    });
  }

  /**
   * Retrieves the versions of the entity with the given id
   * @param id
   * @returns History default response
   * @throws ApiError
   */
  public getDockerRegistryVersions(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docker/registry/{id}/versions',
      path: {
        id: id,
      },
    });
  }

  /**
   * Get entity locking state
   * @param id
   * @returns boolean default response
   * @throws ApiError
   */
  public isDockerRegistryLocked(id: string): Observable<boolean> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docker/registry/{id}/locked',
      path: {
        id: id,
      },
    });
  }

  /**
   * Lock this entity
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public lockDockerRegistry(id: string, requestBody?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry/{id}/locked',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get the table view according to provided request
   * @param requestBody
   * @returns TableResponseDockerRegistryConfiguration default response
   * @throws ApiError
   */
  public getDockerRegistryTable(requestBody?: TableRequest): Observable<TableResponseDockerRegistryConfiguration> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry/table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Restore a version of this entity
   * @param id
   * @param versionId
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public restoreDockerRegistryVersion(id: string, versionId: string): Observable<DockerRegistryConfiguration> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry/{id}/restore/{versionId}',
      path: {
        id: id,
        versionId: versionId,
      },
    });
  }

  /**
   * Saves the provided entity
   * @param requestBody
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public saveDockerRegistry(requestBody?: DockerRegistryConfiguration): Observable<DockerRegistryConfiguration> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
