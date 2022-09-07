/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusObject } from '../models/AsyncTaskStatusObject';
import type { FetchBucketsRequest } from '../models/FetchBucketsRequest';
import type { TimeSeriesAPIResponse } from '../models/TimeSeriesAPIResponse';
import type { TimeSeriesRebuildRequest } from '../models/TimeSeriesRebuildRequest';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class TimeSeriesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns TimeSeriesAPIResponse default response
   * @throws ApiError
   */
  public getBucketsNew(requestBody?: FetchBucketsRequest): Observable<TimeSeriesAPIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series/buckets',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Rebuild a time series based on the provided request
   * @param requestBody
   * @returns AsyncTaskStatusObject default response
   * @throws ApiError
   */
  public rebuildTimeSeries(requestBody?: TimeSeriesRebuildRequest): Observable<AsyncTaskStatusObject> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series/rebuild',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
