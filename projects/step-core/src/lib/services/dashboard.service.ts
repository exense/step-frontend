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
}

getAngularJSGlobal().module(AJS_MODULE).service('DashboardService', downgradeInjectable(DashboardService));
