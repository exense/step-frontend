import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../modules/basics/services/auth.service';
import { ViewRegistryService } from './view-registry.service';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';
import { MultipleProjectsService } from '../modules/basics/services/multiple-projects.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private _http: HttpClient,
    private _authService: AuthService,
    private _viewRegistryService: ViewRegistryService,
    private _multipleProjects: MultipleProjectsService
  ) {}

  generateDashboardLink(parameters: Record<string, any>): string {
    let httpParams = new HttpParams();
    Object.keys(parameters).forEach((key) => {
      httpParams = httpParams.append(key, parameters[key]);
    });
    httpParams = httpParams.append('tsParams', Object.keys(parameters).join(','));

    const currentTenant = this._multipleProjects.currentProject()?.name || '';
    httpParams = httpParams.append('tenant', currentTenant);

    return `#/root/analytics?${httpParams.toString()}`;
  }

  getDashboardLink(taskId: string): string {
    const parameters = {
      taskId,
      refresh: 1,
      relativeRange: ONE_DAY_MS,
    };

    return this.generateDashboardLink(parameters);
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('DashboardService', downgradeInjectable(DashboardService));
