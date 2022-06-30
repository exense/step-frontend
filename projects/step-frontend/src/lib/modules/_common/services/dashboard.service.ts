import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { a1Promise2Observable, AuthService, UibModalHelperService, ViewRegistryService } from '@exense/step-core';
import { Observable } from 'rxjs';

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
