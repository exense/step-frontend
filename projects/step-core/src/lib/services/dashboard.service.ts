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
  private isGrafanaAvailable?: boolean;
  private dashboardLink: ReplaySubject<any> = new ReplaySubject(1);
  private requestingGrafanaAvailable = false;

  constructor(
    private _http: HttpClient,
    private _authService: AuthService,
    private _viewRegistryService: ViewRegistryService
  ) {}

  /*
   * Removed this and use dashboardLink pipe (dashboard-link.pipe.ts) instead when migrating to NG2+
   */
  getDashboardLinkAJS(taskId: string): string {
    if (!this.requestingGrafanaAvailable && typeof this.isGrafanaAvailable === 'undefined') {
      this.checkAvailability(taskId);
    }

    return this.makeDashboardLink(taskId, this.isGrafanaAvailable);
  }

  getDashboardLink(taskId: string): Observable<string> {
    if (!this.requestingGrafanaAvailable && typeof this.isGrafanaAvailable === 'undefined') {
      this.checkAvailability(taskId);
    } else {
      this.dashboardLink.next(this.makeDashboardLink(taskId, this.isGrafanaAvailable));
    }

    return this.dashboardLink;
  }

  private makeDashboardLink(taskId: string, isGrafanaAvailable?: boolean) {
    if (isGrafanaAvailable) {
      return '/#/root/grafana?d=3JB9j357k&orgId=1&var-taskId_current=' + taskId;
    } else {
      return '/#/root/dashboards/__pp__RTMDashboard?__filter1__=text,taskId,' + taskId;
    }
  }

  private checkAvailability(taskId: string) {
    this.requestingGrafanaAvailable = true;

    try {
      if (this._authService.getConf()) {
        if (
          this._authService!.getConf()!.displayNewPerfDashboard &&
          this._viewRegistryService.getCustomView('grafana')
        ) {
          this._http.get<any>('rest/g-dashboards/isGrafanaAvailable').subscribe((response) => {
            this.isGrafanaAvailable = !!response.available;
            this.dashboardLink.next(this.makeDashboardLink(taskId, this.isGrafanaAvailable));
            this.requestingGrafanaAvailable = false;
          });
        } else {
          this.isGrafanaAvailable = false;
          this.dashboardLink.next(this.makeDashboardLink(taskId, false));
          this.requestingGrafanaAvailable = false;
        }
      }
    } catch (e) {}
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('DashboardService', downgradeInjectable(DashboardService));
