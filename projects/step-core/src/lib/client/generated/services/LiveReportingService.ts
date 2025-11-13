/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Measure } from '../models/Measure';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class LiveReportingService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param contextId
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public injectMeasures(contextId: string, requestBody?: Array<Measure>): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/live-reporting/{contextId}/measures',
      path: {
        contextId: contextId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
