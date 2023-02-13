import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../modules/basics/services/auth.service';
import { ViewRegistryService } from './view-registry.service';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private _http: HttpClient,
    private _authService: AuthService,
    private _viewRegistryService: ViewRegistryService
  ) {}

  getDashboardLink(taskId: string): string {
    return `#/root/analytics?taskId=${taskId}&refresh=1&tsParams=taskId,refresh`;
  }

  getRtmDashboardLinkWithFilter(filter: any) {
    let params = Object.keys(filter)
      .map((key, i) => `__filter${i}__=text,${key},${filter[key]}`)
      .join('&');
    return '#/root/dashboards-rtm/__pp__RTMDashboard?' + params;
  }

  getRtmDashboardLink(taskId: string): string {
    return '#/root/dashboards-rtm/__pp__RTMDashboard?__filter1__=text,taskId,' + taskId;
  }

  getRtmExecutionLink(executionId: string): string {
    return `#/root/dashboards-rtm/__pp__RTMDashboard?__filter1__=text,eId,${executionId}`;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('DashboardService', downgradeInjectable(DashboardService));
