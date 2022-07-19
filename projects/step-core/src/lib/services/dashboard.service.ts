import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ViewRegistryService } from './view-registry.service';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private isGrafanaAvailable?: boolean = undefined;

  constructor(
    private _http: HttpClient,
    private _authService: AuthService,
    private _viewRegistryService: ViewRegistryService
  ) {}

  getDashboardLink(taskId: string): string {
    if (typeof this.isGrafanaAvailable === 'undefined') {
      this.checkAvailability();
    }
    if (this.isGrafanaAvailable) {
      return '/#/root/grafana?d=3JB9j357k&orgId=1&var-taskId_current=' + taskId;
    } else {
      return '/#/root/dashboards/__pp__RTMDashboard?__filter1__=text,taskId,' + taskId;
    }
  }

  checkAvailability(override = false) {
    try {
      if (this._authService.getConf()) {
        if (
          this._authService!.getConf()!.displayNewPerfDashboard &&
          this._viewRegistryService.getCustomView('grafana')
        ) {
          this._http.get<any>('rest/g-dashboards/isGrafanaAvailable').subscribe((response) => {
            this.isGrafanaAvailable = !!response.data.available;
          });
        } else {
          this.isGrafanaAvailable = false;
        }
      }
    } catch (e) {}
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('DashboardService', downgradeInjectable(DashboardService));
