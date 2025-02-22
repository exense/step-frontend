/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusObject } from '../models/AsyncTaskStatusObject';
import type { FetchBucketsRequest } from '../models/FetchBucketsRequest';
import type { Measurement } from '../models/Measurement';
import type { MeasurementsStats } from '../models/MeasurementsStats';
import type { MetricType } from '../models/MetricType';
import type { OQLVerifyResponse } from '../models/OQLVerifyResponse';
import type { TimeSeriesAPIResponse } from '../models/TimeSeriesAPIResponse';
import type { TimeSeriesRebuildRequest } from '../models/TimeSeriesRebuildRequest';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class TimeSeriesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param filter
   * @param limit
   * @param skip
   * @returns Measurement default response
   * @throws ApiError
   */
  public discoverMeasurements(filter?: string, limit?: number, skip?: number): Observable<Array<Measurement>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/time-series/raw-measurements',
      query: {
        filter: filter,
        limit: limit,
        skip: skip,
      },
    });
  }

  /**
   * @param requestBody
   * @returns TimeSeriesAPIResponse default response
   * @throws ApiError
   */
  public getMeasurements(requestBody: FetchBucketsRequest): Observable<TimeSeriesAPIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series/measurements',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param filter
   * @returns string default response
   * @throws ApiError
   */
  public getMeasurementsAttributes(filter?: string): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/time-series/measurements-fields',
      query: {
        filter: filter,
      },
    });
  }

  /**
   * Returns the list of all supported metric types
   * @returns MetricType default response
   * @throws ApiError
   */
  public getMetricTypes(): Observable<Array<MetricType>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/time-series/metric-types',
    });
  }

  /**
   * @param filter
   * @returns MeasurementsStats default response
   * @throws ApiError
   */
  public getRawMeasurementsStats(filter?: string): Observable<MeasurementsStats> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/time-series/raw-measurements/stats',
      query: {
        filter: filter,
      },
    });
  }

  /**
   * @param requestBody
   * @returns TimeSeriesAPIResponse default response
   * @throws ApiError
   */
  public getTimeSeries(requestBody: FetchBucketsRequest): Observable<TimeSeriesAPIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns TimeSeriesAPIResponse default response
   * @throws ApiError
   */
  public getReportNodesTimeSeries(requestBody: FetchBucketsRequest): Observable<TimeSeriesAPIResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series/report-nodes',
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
  public rebuildTimeSeries(requestBody: TimeSeriesRebuildRequest): Observable<AsyncTaskStatusObject> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/time-series/rebuild',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Check if the time-series was created for a specific execution
   * @param executionId
   * @returns boolean default response
   * @throws ApiError
   */
  public checkTimeSeries(executionId: string): Observable<boolean> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/time-series/execution/{executionId}/exists',
      path: {
        executionId: executionId,
      },
    });
  }

  /**
   * @param oql
   * @returns OQLVerifyResponse default response
   * @throws ApiError
   */
  public verifyOql(oql: string): Observable<OQLVerifyResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/time-series/oql-verify',
      query: {
        oql: oql,
      },
    });
  }
}
