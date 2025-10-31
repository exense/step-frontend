/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { FormDataContentDisposition } from '../models/FormDataContentDisposition';
import type { Resource } from '../models/Resource';
import type { ResourceUploadResponse } from '../models/ResourceUploadResponse';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public bulkDelete1(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/resources/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param type
   * @param directory
   * @param trackingAttribute
   * @param origin
   * @param originTimestamp
   * @param formData
   * @returns ResourceUploadResponse default response
   * @throws ApiError
   */
  public createResource(
    type?: string,
    directory?: boolean,
    trackingAttribute?: string,
    origin?: string,
    originTimestamp?: number,
    formData?: {
      file?: FormDataContentDisposition;
    },
  ): Observable<ResourceUploadResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/resources/content',
      query: {
        type: type,
        directory: directory,
        trackingAttribute: trackingAttribute,
        origin: origin,
        originTimestamp: originTimestamp,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param id
   * @returns Resource default response
   * @throws ApiError
   */
  public getResource(id: string): Observable<Resource> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/resources/{id}',
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
  public deleteResource(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/resources/{id}',
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
  public deleteResourceRevisions(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/resources/{id}/revisions',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param requestBody
   * @returns Resource default response
   * @throws ApiError
   */
  public findManyByCriteria(requestBody?: Record<string, string>): Observable<Array<Resource>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/resources/find',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @param inline
   * @returns any default response
   * @throws ApiError
   */
  public getResourceContent(id: string, inline?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/resources/{id}/content',
      path: {
        id: id,
      },
      query: {
        inline: inline,
      },
    });
  }

  /**
   * @param id
   * @param formData
   * @returns ResourceUploadResponse default response
   * @throws ApiError
   */
  public saveResourceContent(
    id: string,
    formData?: {
      file?: FormDataContentDisposition;
    },
  ): Observable<ResourceUploadResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/resources/{id}/content',
      path: {
        id: id,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }

  /**
   * @param id
   * @param inline
   * @returns any default response
   * @throws ApiError
   */
  public getResourceRevisionContent(id: string, inline?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/resources/revision/{id}/content',
      path: {
        id: id,
      },
      query: {
        inline: inline,
      },
    });
  }

  /**
   * @param requestBody
   * @returns Resource default response
   * @throws ApiError
   */
  public saveResource(requestBody?: Resource): Observable<Resource> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/resources',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
