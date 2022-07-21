import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FindBucketsRequest } from './find-buckets-request';
import { TimeSeriesChartResponse } from './time-series-chart-response';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesService {
  constructor(private http: HttpClient) {}

  fetchBuckets(request: FindBucketsRequest): Observable<any> {
    return this.http.post<any>(`/rest/time-series/buckets`, request);
  }

  fetchBucketsNew(request: FindBucketsRequest): Observable<TimeSeriesChartResponse> {
    return this.http.post<TimeSeriesChartResponse>(`/rest/time-series/buckets-new`, request);
  }

  getExecutionDetails(id: string): Observable<any> {
    return this.http.get<any>(`/rest/executions/${id}`);
  }
}
