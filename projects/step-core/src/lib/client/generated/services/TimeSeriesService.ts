/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Bucket } from '../models/Bucket';
import type { FetchBucketsRequest } from '../models/FetchBucketsRequest';
import type { TimeSeriesAPIResponse } from '../models/TimeSeriesAPIResponse';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class TimeSeriesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param requestBody
   * @returns Bucket default response
   * @throws ApiError
   */
  public getBuckets(requestBody?: FetchBucketsRequest): Observable<Record<string, Record<string, Bucket>>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series/buckets',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns TimeSeriesAPIResponse default response
   * @throws ApiError
   */
  public getBucketsNew(requestBody?: FetchBucketsRequest): Observable<TimeSeriesAPIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series/buckets-new',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
