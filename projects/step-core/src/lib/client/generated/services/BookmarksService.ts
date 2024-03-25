/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { History } from '../models/History';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponseUserBookmark } from '../models/TableResponseUserBookmark';
import type { UserBookmark } from '../models/UserBookmark';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class BookmarksService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deleteUserBookmarks(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns UserBookmark default response
   * @throws ApiError
   */
  public cloneUserBookmark(id: string): Observable<UserBookmark> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/bookmarks/{id}/clone',
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
  public cloneUserBookmarks(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves an entity by its Id
   * @param id
   * @returns UserBookmark default response
   * @throws ApiError
   */
  public getUserBookmarkById(id: string): Observable<UserBookmark> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/bookmarks/{id}',
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
  public deleteUserBookmark(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/bookmarks/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the list of entities for the provided list of IDs
   * @param requestBody
   * @returns UserBookmark default response
   * @throws ApiError
   */
  public findUserBookmarksByIds(requestBody?: Array<string>): Observable<Array<UserBookmark>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks/find/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns UserBookmark default response
   * @throws ApiError
   */
  public findUserBookmarksByAttributes(requestBody?: Record<string, string>): Observable<Array<UserBookmark>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks/find',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Retrieves the versions of the entity with the given id
   * @param id
   * @returns History default response
   * @throws ApiError
   */
  public getUserBookmarkVersions(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/bookmarks/{id}/versions',
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
  public isUserBookmarkLocked(id: string): Observable<boolean> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/bookmarks/{id}/locked',
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
  public lockUserBookmark(id: string, requestBody?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks/{id}/locked',
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
   * @returns TableResponseUserBookmark default response
   * @throws ApiError
   */
  public getUserBookmarkTable(requestBody?: TableRequest): Observable<TableResponseUserBookmark> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks/table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Restore a version of this entity
   * @param id
   * @param versionId
   * @returns UserBookmark default response
   * @throws ApiError
   */
  public restoreUserBookmarkVersion(id: string, versionId: string): Observable<UserBookmark> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks/{id}/restore/{versionId}',
      path: {
        id: id,
        versionId: versionId,
      },
    });
  }

  /**
   * Saves the provided entity
   * @param requestBody
   * @returns UserBookmark default response
   * @throws ApiError
   */
  public saveUserBookmark(requestBody?: UserBookmark): Observable<UserBookmark> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/bookmarks',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
