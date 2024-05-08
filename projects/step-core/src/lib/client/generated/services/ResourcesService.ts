/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { FormDataContentDisposition } from '../models/FormDataContentDisposition';
import type { Resource } from '../models/Resource';
import type { ResourceUploadResponse } from '../models/ResourceUploadResponse';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param type
   * @param duplicateCheck
   * @param directory
   * @param trackingAttribute
   * @param formData
   * @returns ResourceUploadResponse default response
   * @throws ApiError
   */
  public createResource(
    type?: string,
    duplicateCheck?: boolean,
    directory?: boolean,
    trackingAttribute?: string,
    formData?: {
      file?: FormDataContentDisposition;
    },
  ): Observable<ResourceUploadResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/resources/content',
      query: {
        type: type,
        duplicateCheck: duplicateCheck,
        directory: directory,
        trackingAttribute: trackingAttribute,
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
