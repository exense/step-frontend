import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FindBucketsRequest } from './find-buckets-request';
import { TimeSeriesChartResponse } from './time-series-chart-response';
import { AsyncTaskStatusResource, AuthService, Execution } from '@exense/step-core';
import { TimeSeriesConfig } from './time-series.config';

// TODO provide it it TimeSeriesModule
@Injectable({
  providedIn: 'root',
})
export class TimeSeriesService {
  private readonly resolutionPeriod: number; // this is received from the backend

  constructor(private http: HttpClient, private authService: AuthService) {
    this.resolutionPeriod =
      parseInt(authService.getConf()?.miscParams[TimeSeriesConfig.SERVICE_RESOLUTION_CONFIG_PROPERTY]!) ||
      TimeSeriesConfig.DEFAULT_RESOLUTION;
  }

  fetchBuckets(request: FindBucketsRequest): Observable<TimeSeriesChartResponse> {
    return this.http.post<TimeSeriesChartResponse>(`/rest/time-series/buckets`, request);
  }

  timeSeriesIsBuilt(executionId: string): Observable<boolean> {
    return this.http.get<boolean>(`/rest/time-series/execution/${executionId}/exists`);
  }

  rebuildTimeSeries(executionId: string): Observable<AsyncTaskStatusResource> {
    return this.http.post<AsyncTaskStatusResource>(`/rest/time-series/rebuild`, { executionId: executionId });
  }

  getResolution(): number {
    return this.resolutionPeriod;
  }
}
