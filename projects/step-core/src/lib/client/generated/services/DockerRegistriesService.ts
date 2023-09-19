/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DockerRegistryConfiguration } from '../models/DockerRegistryConfiguration';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class DockerRegistriesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public getDockerRegistryConfiguration(id: string): Observable<DockerRegistryConfiguration> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docker/registry/{id}',
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
  public deleteDockerRegistryConfiguration(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/docker/registry/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * @returns DockerRegistryConfiguration default response
   * @throws ApiError
   */
  public getDockerRegistryConfigurations(): Observable<Array<DockerRegistryConfiguration>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/docker/registry/list',
    });
  }

  /**
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public saveDockerRegistryConfiguration(requestBody?: DockerRegistryConfiguration): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/docker/registry',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
