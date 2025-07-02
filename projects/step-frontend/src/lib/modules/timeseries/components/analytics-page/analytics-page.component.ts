import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TimeSeriesConfig, TimeSeriesEntityService } from '../../modules/_common';
import { AuthService } from '@exense/step-core';
import { DashboardViewSettingsBtnLocation } from '../dashboard/dashboard-view-settings-btn-location';
import { DashboardPageComponent } from '../dashboard-page/dashboard-page.component';

/**
 * Analytics page is just a wrapper over the dashboard-page, so the url is easier to be accessed (without a dashboard id in it)
 */
@Component({
  selector: 'step-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
  imports: [DashboardPageComponent],
})
export class AnalyticsPageComponent implements OnInit, OnDestroy {
  private _authService: AuthService = inject(AuthService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);

  dashboardId?: string;

  SETTINGS_LOCATION = DashboardViewSettingsBtnLocation;

  ngOnInit(): void {
    this.dashboardId = this._authService.getConf()!.miscParams![TimeSeriesConfig.PARAM_KEY_ANALYTICS_DASHBOARD_ID];
    if (!this.dashboardId) {
      throw new Error('Analytics dashboard id is not present on conf');
    }
  }

  ngOnDestroy(): void {
    this._timeSeriesEntityService.clearCache();
  }
}
