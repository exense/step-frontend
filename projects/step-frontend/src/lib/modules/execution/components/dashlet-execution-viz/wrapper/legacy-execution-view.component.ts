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
import { ExecutionStateService } from '../../../services/execution-state.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { DashboardUrlParamsService } from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { TimeSeriesConfig, TimeSeriesContext, TimeSeriesUtils } from '../../../../timeseries/modules/_common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService, DashboardsService, DashboardView, Execution, TimeRange } from '@exense/step-core';

@Component({
  selector: 'step-legacy-execution-view',
  templateUrl: './legacy-execution-view.component.html',
  styleUrls: ['./legacy-execution-view.component.scss'],
})
export class LegacyExecutionViewComponent implements OnInit {
  execution = input.required<Execution>();

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

  timeRange: Signal<TimeRange | undefined> = computed(() => {
    console.log('time ranged changed');
    const pickerSelection = this.activeTimeRangeSelection();
    if (pickerSelection) {
      if (pickerSelection.type === 'FULL') {
        let execution = this.execution();
        return { from: execution.startTime!, to: execution.endTime || new Date().getTime() };
      } else {
        return TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection);
      }
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
        this.activeTimeRangeSelection.set(urlParams.timeRange);
      } else {
        this.activeTimeRangeSelection.set({ type: 'FULL' });
      }
    });

    this.subscribeToUrlNavigation();
  }

  handleDashboardSettingsChange(context: TimeSeriesContext) {
    this._urlParamsService.updateUrlParamsFromContext(
      context,
      this.activeTimeRangeSelection()!,
      this.refreshInterval(),
    );
  }

  handleDashboardSettingsInit(context: TimeSeriesContext) {
    this._urlParamsService.updateUrlParamsFromContext(
      context,
      this.activeTimeRangeSelection()!,
      this.refreshInterval(),
      true,
    );
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
