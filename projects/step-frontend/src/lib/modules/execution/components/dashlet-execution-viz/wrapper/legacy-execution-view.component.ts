import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DashboardUrlParamsService } from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { TimeSeriesConfig, TimeSeriesContext, TimeSeriesUtils } from '../../../../timeseries/modules/_common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, pairwise } from 'rxjs';
import { AuthService, DashboardsService, DashboardView, Execution, TimeRange } from '@exense/step-core';

@Component({
  selector: 'step-legacy-execution-view',
  templateUrl: './legacy-execution-view.component.html',
  styleUrls: ['./legacy-execution-view.component.scss'],
  standalone: false,
})
export class LegacyExecutionViewComponent implements OnInit {
  execution = input.required<Execution>();

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
  isLoading = signal<boolean>(false);

  timeRange: Signal<TimeRange | undefined> = computed(() => {
    console.log('time ranged changed');
    const pickerSelection = this.activeTimeRangeSelection();
    if (pickerSelection) {
      const execution = this.execution();
      const end = execution.endTime || new Date().getTime();
      if (pickerSelection.type === 'FULL') {
        return { from: execution.startTime!, to: end };
      } else {
        return TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection, end);
      }
    } else {
      return undefined;
    }
  });

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

  handleFullRangeChangeRequest(range: TimeRange) {
    this.activeTimeRangeSelection.set({ type: 'ABSOLUTE', absoluteSelection: range });
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

  private findRelativeTimeOption(relativeMs: number): TimeRangePickerSelection {
    return (
      this.timeRangeOptions.find((o) => o.relativeSelection?.timeInMs === relativeMs) || {
        type: 'RELATIVE',
        relativeSelection: { timeInMs: relativeMs },
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
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        pairwise(), // Gives us [previousEvent, currentEvent]
        filter(
          ([prev, curr]) =>
            prev instanceof NavigationStart && curr instanceof NavigationEnd && prev.navigationTrigger === 'popstate',
        ),
      )
      .subscribe(() => {
        this.isLoading.set(true);
        let urlParams = this._urlParamsService.collectUrlParams();
        this._changeDetectorRef.detectChanges();
        if (urlParams.timeRange?.type === 'RELATIVE') {
          // find the selection with label
          urlParams.timeRange = this.findRelativeTimeOption(urlParams.timeRange!.relativeSelection!.timeInMs);
        }
        this.activeTimeRangeSelection.set(urlParams.timeRange!);
        this.isLoading.set(false);
      });
  }
}
