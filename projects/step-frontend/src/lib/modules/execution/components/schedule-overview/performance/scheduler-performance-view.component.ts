import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AuthService, TimeRange } from '@exense/step-core';
import { FilterBarItem, TimeSeriesConfig, TimeSeriesContext } from '../../../../timeseries/modules/_common';
import { SchedulerPageStateService } from '../scheduler-page-state.service';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { DashboardUrlParamsService } from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, pairwise } from 'rxjs';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'step-scheduler-performance-view',
  templateUrl: './scheduler-performance-view.component.html',
  styleUrls: ['./scheduler-performance-view.component.scss'],
})
export class SchedulerPerformanceViewComponent implements OnInit {
  private _authService = inject(AuthService);
  readonly _state = inject(SchedulerPageStateService);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  protected readonly timeRange = signal<TimeRangePickerSelection | undefined>(undefined);
  isLoading = false;

  dashboardId?: string;
  dashboardFilters: FilterBarItem[] = [];

  activeTimeRangeSelection = toSignal(this._state.timeRangeSelection$);

  constructor() {
    this.dashboardId = this._authService.getConf()!.miscParams![TimeSeriesConfig.PARAM_KEY_ANALYTICS_DASHBOARD_ID];
    this.dashboardFilters = this._state.getDashboardFilters();
  }

  ngOnInit(): void {
    this.subscribeToUrlNavigation();
  }

  handleDashboardSettingsChange(context: TimeSeriesContext) {
    this._urlParamsService.updateUrlParamsFromContext(context, this.activeTimeRangeSelection()!, undefined, false);
  }

  handleDashboardSettingsInit(context: TimeSeriesContext) {
    this._urlParamsService.updateUrlParamsFromContext(context, this.activeTimeRangeSelection()!, undefined, true);
  }

  handleFullRangeChangeRequest(range: TimeRange) {
    this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: range });
  }

  private subscribeToUrlNavigation() {
    // subscribe to back and forward events
    this._router.events
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        pairwise(), // Gives us [previousEvent, currentEvent]
        filter(
          ([prev, curr]) =>
            prev instanceof NavigationStart && curr instanceof NavigationEnd && prev.navigationTrigger === 'popstate',
        ),
      )
      .subscribe(() => {
        this.isLoading = true;
        let params = this._urlParamsService.collectUrlParams();
        if (params.timeRange) {
          this._state.updateTimeRangeSelection(params.timeRange!);
        }
        // we need time for the time range to propagate so it doesn't trigger a change in the context
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      });
  }
}
