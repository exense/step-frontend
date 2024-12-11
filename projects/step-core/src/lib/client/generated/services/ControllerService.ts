/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ArtefactInfo } from '../models/ArtefactInfo';
import type { Plan } from '../models/Plan';
import type { ReportNode } from '../models/ReportNode';
import type { RepositoryObjectReference } from '../models/RepositoryObjectReference';
import type { Status } from '../models/Status';
import type { TestSetStatusOverview } from '../models/TestSetStatusOverview';
import type { Version } from '../models/Version';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ControllerService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns ArtefactInfo default response
   * @throws ApiError
   */
  public getArtefactInfo(requestBody?: RepositoryObjectReference): Observable<ArtefactInfo> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/controller/repository/artefact/info',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns Status default response
   * @throws ApiError
   */
  public getControllerStatus(): Observable<Status> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/status',
    });
  }

  /**
   * @returns string default response
   * @throws ApiError
   */
  public getLibVersions(): Observable<Record<string, string>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/lib/versions',
    });
  }

  /**
   * @param requestBody
   * @returns TestSetStatusOverview default response
   * @throws ApiError
   */
  public getReport(requestBody?: RepositoryObjectReference): Observable<TestSetStatusOverview> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/controller/repository/report',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @returns ReportNode default response
   * @throws ApiError
   */
  public getReportNode(id: string): Observable<ReportNode> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/reportnode/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @param skip
   * @param limit
   * @returns ReportNode default response
   * @throws ApiError
   */
  public getReportNodeChildren(id: string, skip?: number, limit?: number): Observable<Array<ReportNode>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/reportnode/{id}/children',
      path: {
        id: id,
      },
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * @param id
   * @param source
   * @param skip
   * @param limit
   * @returns ReportNode default response
   * @throws ApiError
   */
  public getReportNodeChildrenBySource(
    id: string,
    source: 'BEFORE' | 'BEFORE_THREAD' | 'MAIN' | 'SUB_PLAN' | 'AFTER_THREAD' | 'AFTER',
    skip?: number,
    limit?: number,
  ): Observable<Array<ReportNode>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/reportnode/{id}/children/{source}',
      path: {
        id: id,
        source: source,
      },
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * @param id
   * @returns ReportNode default response
   * @throws ApiError
   */
  public getReportNodePath(id: string): Observable<Array<ReportNode>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/reportnode/{id}/path',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @returns Plan default response
   * @throws ApiError
   */
  public getReportNodeRootPlan(id: string): Observable<Plan> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/reportnode/{id}/plan',
      path: {
        id: id,
      },
    });
  }

  /**
   * @returns Version default response
   * @throws ApiError
   */
  public getVersion(): Observable<Version> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/controller/version',
    });
  }

  /**
   * @returns any default response
   * @throws ApiError
   */
  public shutdown(): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/controller/shutdown',
    });
  }
}
