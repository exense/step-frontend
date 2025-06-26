import { Component, DestroyRef, inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
  COMMON_IMPORTS,
  ResolutionPickerComponent,
  TimeSeriesConfig,
  TimeSeriesEntityService,
} from '../../modules/_common';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '@exense/step-core';
import { DashboardViewSettingsBtnLocation } from '../dashboard/dashboard-view-settings-btn-location';
import { TimeRangePickerComponent } from '../../modules/_common/components/time-range-picker/time-range-picker.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
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
