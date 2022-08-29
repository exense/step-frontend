import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FindBucketsRequest } from './find-buckets-request';
import { TimeSeriesChartResponse } from './time-series-chart-response';
import { Execution } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesService {
  constructor(private http: HttpClient) {}

  fetchBuckets(request: FindBucketsRequest): Observable<TimeSeriesChartResponse> {
    return this.http.post<TimeSeriesChartResponse>(`/rest/time-series/buckets`, request);
  }

  getExecutionDetails(id: string): Observable<Execution> {
    return this.http.get<Execution>(`/rest/executions/${id}`);
  }
}
