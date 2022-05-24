import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Observable} from 'rxjs';
import {FindBucketsRequest} from './find-buckets-request';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesService {

  constructor(private http: HttpClient) {

  }

  fetchBuckets(request: FindBucketsRequest): Observable<any> {
    return this.http.post<any>(`/rest/time-series/buckets`, request);
  }


}
