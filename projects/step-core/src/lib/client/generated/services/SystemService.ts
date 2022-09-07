/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Operation } from '../models/Operation';
import type { OperationDetails } from '../models/OperationDetails';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class SystemService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param eid
   * @returns Operation default response
   * @throws ApiError
   */
  public getCurrentOperations(eid?: string): Observable<Array<Operation>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/threadmanager/operations',
      query: {
        eid: eid,
      },
    });
  }

  /**
   * @returns OperationDetails default response
   * @throws ApiError
   */
  public getCurrentOperationsList(): Observable<Array<OperationDetails>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/threadmanager/operations/list',
    });
  }

  /**
   * @param reportnodeid
   * @returns Operation default response
   * @throws ApiError
   */
  public getOperationsByReportNodeId(reportnodeid: string): Observable<Array<Operation>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/threadmanager/operations/{reportnodeid}',
      path: {
        reportnodeid: reportnodeid,
      },
    });
  }
}
