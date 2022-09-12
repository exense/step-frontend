import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ViewRegistryService } from './view-registry.service';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';
import { lastValueFrom, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  constructor(
    private _http: HttpClient,
    private _authService: AuthService,
    private _viewRegistryService: ViewRegistryService
  ) {}

  // FIXME: link to new dashboard
  getDashboardLink(taskId: string): string {
    return '/#/root/dashboards/__pp__RTMDashboard?__filter1__=text,taskId,' + taskId;
  }

}
