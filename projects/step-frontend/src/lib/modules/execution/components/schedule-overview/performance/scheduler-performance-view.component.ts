import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@exense/step-core';
import { FilterBarItem, TimeSeriesConfig } from '../../../../timeseries/modules/_common';
import { SchedulerPageStateService } from '../scheduler-page-state.service';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';

@Component({
  selector: 'step-scheduler-performance-view',
  templateUrl: './scheduler-performance-view.component.html',
  styleUrls: ['./scheduler-performance-view.component.scss'],
})
export class SchedulerPerformanceViewComponent {
  private _authService = inject(AuthService);
  readonly _stateService = inject(SchedulerPageStateService);
  protected readonly timeRange = signal<TimeRangePickerSelection | undefined>(undefined);

  dashboardId?: string;
  dashboardFilters: Partial<FilterBarItem>[];

  constructor() {
    this.dashboardId = this._authService.getConf()!.miscParams![TimeSeriesConfig.PARAM_KEY_ANALYTICS_DASHBOARD_ID];
    this.dashboardFilters = this._stateService.getDashboardFilters();
  }
}
