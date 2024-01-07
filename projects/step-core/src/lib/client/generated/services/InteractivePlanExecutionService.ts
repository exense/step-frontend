/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ExecutionParameters } from '../models/ExecutionParameters';
import type { ReportNode } from '../models/ReportNode';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class InteractivePlanExecutionService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @param planid
   * @param artefactid
   * @returns ReportNode default response
   * @throws ApiError
   */
  public executeArtefact(id: string, planid: string, artefactid: string): Observable<ReportNode> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/interactive/{id}/execute/{planid}/{artefactid}',
      path: {
        id: id,
        planid: planid,
        artefactid: artefactid,
      },
    });
  }

  /**
   * @param id
   * @param functionid
   * @param artefactid
   * @returns ReportNode default response
   * @throws ApiError
   */
  public executeCompositeFunction(id: string, functionid: string, artefactid: string): Observable<ReportNode> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/interactive/{id}/executefunction/{functionid}/{artefactid}',
      path: {
        id: id,
        functionid: functionid,
        artefactid: artefactid,
      },
    });
  }

  /**
   * @param requestBody
   * @returns string default response
   * @throws ApiError
   */
  public startInteractiveSession(requestBody?: ExecutionParameters): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/interactive/start',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public stopInteractiveSession(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/interactive/{id}/stop',
      path: {
        id: id,
      },
    });
  }
}
