/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { MetricSample } from '../models/MetricSample';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class RawMetricSamplesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Returns the aggregated metric samples for the provided report node id
   * @param rnId
   * @returns MetricSample default response
   * @throws ApiError
   */
  public getAggregatedMetricSamples(rnId: string): Observable<Array<MetricSample>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/raw-samples/metric-samples/{rnId}/aggregated',
      path: {
        rnId: rnId,
      },
    });
  }
}
