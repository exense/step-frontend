import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { AuthService, CustomComponent, DashboardsService, DashboardView } from '@exense/step-core';
import { ExecutionStateService } from '../../services/execution-state.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { TimeSeriesConfig, TimeSeriesContext, TimeSeriesUtils } from '../../../timeseries/modules/_common';
import { filter, Observable, shareReplay, switchMap, take } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-dashlet-execution-viz',
  templateUrl: './dashlet-execution-viz.component.html',
  styleUrls: ['./dashlet-execution-viz.component.scss'],
})
export class DashletExecutionVizComponent implements CustomComponent, OnInit {
  _state = inject(ExecutionStateService);
  context?: any;

  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _dashboardService = inject(DashboardsService);
  private _authService = inject(AuthService);
  private _urlParamsService = inject(DashboardUrlParamsService);

  readonly timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.EXECUTION_PAGE_TIME_SELECTION_OPTIONS;
  activeTimeRangeSelection: WritableSignal<TimeRangePickerSelection | undefined> = signal(undefined);

  refreshInterval = signal<number>(0);

  dashboardId!: string;
  dashboard!: DashboardView;

  hasWritePermission = this._authService.hasRight('dashboard-write');

  timeRange = computed(() => {
    const pickerSelection = this.activeTimeRangeSelection();
    if (pickerSelection) {
      return TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection, this._state.execution?.endTime);
    } else {
      return undefined;
    }
  });

  dashboardIdInternal?: string;

  ngOnInit(): void {
    this.dashboardId = this._authService.getConf()!.miscParams![TimeSeriesConfig.PARAM_KEY_ANALYTICS_DASHBOARD_ID];
    if (!this.dashboardId) {
      throw new Error('Dashboard id is not present on the config');
    }
    this._dashboardService.getDashboardById(this.dashboardId).subscribe((dashboard) => {
      this.dashboard = dashboard;
      const urlParams = this._urlParamsService.collectUrlParams();
      if (urlParams.timeRange) {
        if (urlParams.timeRange.type === 'RELATIVE') {
          // find the selection with label
          urlParams.timeRange = this.findRelativeTimeOption(urlParams.timeRange.relativeSelection!.timeInMs);
        }
        this.activeTimeRangeSelection.set(urlParams.timeRange!);
      } else {
        if (this.dashboard.timeRange.type === 'RELATIVE') {
          this.dashboard.timeRange = this.findRelativeTimeOption(this.dashboard!.timeRange.relativeSelection!.timeInMs);
        }
        this.activeTimeRangeSelection.set(this.dashboard.timeRange);
      }
    });

    this.subscribeToUrlNavigation();
  }

  handleZoomChange() {
    console.log('zoom change');
  }

  handleZoomReset() {
    console.log('zoom reset');
  }

  private findRelativeTimeOption(relativeMs: number): TimeRangePickerSelection {
    return (
      this.timeRangeOptions.find((o) => o.relativeSelection?.timeInMs === relativeMs) || {
        type: 'RELATIVE',
        relativeSelection: { timeInMs: relativeMs, label: `Last ${relativeMs} ms` },
      }
    );
  }

  handleTimeRangeChange(pickerSelection: TimeRangePickerSelection) {
    this.activeTimeRangeSelection.set(pickerSelection);
  }

  handleDashboardSettingsChange(context: TimeSeriesContext) {
    console.log('SETTINGS CHANGED');
    this._urlParamsService.updateUrlParamsFromContext(context, this.activeTimeRangeSelection()!);
  }

  triggerRefresh() {
    let rangeSelection = this.activeTimeRangeSelection()!;
    this.activeTimeRangeSelection.set({ ...rangeSelection });
  }

  private subscribeToUrlNavigation() {
    // subscribe to back and forward events
    this._router.events
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((event) => event instanceof NavigationStart),
        filter((event: NavigationStart) => event.navigationTrigger === 'popstate'),
      )
      .subscribe(() => {
        const actualDashboardId = this.dashboardIdInternal;
        this.dashboardIdInternal = undefined;
        this._changeDetectorRef.detectChanges();
        this.dashboardIdInternal = actualDashboardId;
      });
  }
}
