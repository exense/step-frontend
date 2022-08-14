import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardEntry } from './model/dashboard-entry';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  constructor(private _httpClient: HttpClient) {}

  getDashboardEntries(): Observable<DashboardEntry[]> {
    return this._httpClient.get<DashboardEntry[]>('/rest/monitoringdashboard/get');
  }
}
