import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
  untracked,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { COMMON_IMPORTS, TimeSeriesConfig, TimeSeriesContext, TimeSeriesUtils } from '../../modules/_common';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { TimeRangePickerComponent } from '../../modules/_common/components/time-range-picker/time-range-picker.component';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, of, pairwise, switchMap } from 'rxjs';
import { TimeRangePickerSelection } from '../../modules/_common/types/time-selection/time-range-picker-selection';
import { AuthService, DashboardsService, DashboardView, ReloadableDirective, TimeRange } from '@exense/step-core';
import { DashboardUrlParamsService } from '../../modules/_common/injectables/dashboard-url-params.service';

interface UrlParams {
  timeRange?: TimeRangePickerSelection;
  refreshInterval?: number;
}

@Component({
  selector: 'step-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  providers: [DashboardUrlParamsService],
  hostDirectives: [ReloadableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [COMMON_IMPORTS, TimeRangePickerComponent, DashboardComponent],
})
export class DashboardPageComponent implements OnInit {
  private _router: Router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _dashboardService = inject(DashboardsService);
  private _authService = inject(AuthService);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private _activatedRoute = inject(ActivatedRoute);
  private dashboardComponent = viewChild('dashboardComponent', { read: DashboardComponent });

  readonly timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  activeTimeRangeSelection: WritableSignal<TimeRangePickerSelection | undefined> = signal(undefined);

  // Dashboard ID can be provided through route or as component input
  readonly dashboardFromInputId = input<string | null>(null, { alias: 'dashboardId' });
  private readonly dashboardFromInput = toSignal(
    toObservable(this.dashboardFromInputId).pipe(
      switchMap((id) => (id ? this._dashboardService.getDashboardById(id) : of(undefined))),
    ),
    { initialValue: undefined },
  );

  private readonly dashboardFromRoute = toSignal(
    this._activatedRoute.data.pipe(map((data) => data['dashboard'] as DashboardView)),
    { initialValue: null },
  );

  readonly dashboard = computed(() => {
    return this.dashboardFromInput() ?? this.dashboardFromRoute();
  });

  showRefreshToggle = input<boolean>(true);
  refreshInterval = signal<number>(0);

  hasWritePermission = this._authService.hasRight('dashboard-write');

  isLoading = signal<boolean>(false);

  timeRange = computed<TimeRange | undefined>(() => {
    const pickerSelection = this.activeTimeRangeSelection();
    if (pickerSelection) {
      return TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection);
    } else {
      return undefined;
    }
  });

  dashboardFetchEffect = effect(() => {
    const dashboard = this.dashboard();
    const activeTimeRangeSelection = this.activeTimeRangeSelection();
    if (dashboard && activeTimeRangeSelection === undefined) {
      untracked(() => {
        if (dashboard!.timeRange.type === 'RELATIVE' && !dashboard!.timeRange.relativeSelection?.label) {
          dashboard.timeRange = this.findRelativeTimeOption(dashboard!.timeRange.relativeSelection!.timeInMs);
        }
        if (dashboard!.timeRange.type === 'FULL') {
          dashboard.timeRange = this.timeRangeOptions[0];
        }
        this.activeTimeRangeSelection.set(dashboard!.timeRange);
      });
    }
  });

  ngOnInit(): void {
    const urlParams = this.extractUrlParams();
    if (urlParams.timeRange) {
      this.activeTimeRangeSelection.set(urlParams.timeRange);
    }
    this.refreshInterval.set(urlParams.refreshInterval || 0);
    if (!this.dashboard()) {
      throw new Error('Dashboard id not present');
    }

    this.subscribeToUrlNavigation();
  }

  handleDashboardUpdate(dashboard: DashboardView) {
    // the dashboard is editable. this will make sure there are no conflicts between the dashboard entity shared across this page and actual dashboard component
    const mergedDashboard: DashboardView = {
      ...dashboard,
      attributes: this.dashboard!()!.attributes,
      description: this.dashboard!()!.description,
    };
    this._dashboardService.saveDashboard(mergedDashboard).subscribe((response) => {});
  }

  handleRefreshIntervalChange(interval: number) {
    this.refreshInterval.set(interval);
    this._urlParamsService.updateRefreshInterval(interval, false);
  }

  handleFullRangeChanged(range: TimeRange) {
    this.activeTimeRangeSelection.set({ type: 'ABSOLUTE', absoluteSelection: range });
  }

  private findRelativeTimeOption(relativeMs: number): TimeRangePickerSelection {
    return (
      this.timeRangeOptions.find((o) => o.relativeSelection?.timeInMs === relativeMs) || {
        type: 'RELATIVE',
        relativeSelection: { timeInMs: relativeMs },
      }
    );
  }

  handleDashboardSettingsChange(context: TimeSeriesContext) {
    this._urlParamsService.updateUrlParamsFromContext(
      context,
      this.activeTimeRangeSelection()!,
      this.showRefreshToggle() ? this.refreshInterval() : undefined,
    );
  }

  handleDashboardSettingsInit(context: TimeSeriesContext) {
    this._urlParamsService.updateUrlParamsFromContext(
      context,
      this.activeTimeRangeSelection()!,
      this.showRefreshToggle() ? this.refreshInterval() : undefined,
      true,
    );
  }

  handleTimeRangeChange(pickerSelection: TimeRangePickerSelection) {
    this.activeTimeRangeSelection.set(pickerSelection);
    let timeRange = TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection);
    this.dashboardComponent()?.updateFullTimeRange(timeRange, { actionType: 'manual' });
  }

  triggerRefresh() {
    let pickerSelection = this.activeTimeRangeSelection()!;
    let timeRange = TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection);
    this.dashboardComponent()?.updateFullTimeRange(timeRange, { actionType: 'auto' });
  }

  private subscribeToUrlNavigation() {
    // subscribe to back and forward events
    this._router.events
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        pairwise(),
        filter(
          ([prev, curr]) =>
            prev instanceof NavigationStart && curr instanceof NavigationEnd && prev.navigationTrigger === 'popstate',
        ),
      )
      .subscribe(() => {
        this.isLoading.set(true);
        const timeRangeInUrl = this.extractTimeRangeFromUrl();
        let refreshInterval = this.extractUrlParams().refreshInterval;
        if (timeRangeInUrl) {
          this.activeTimeRangeSelection.set(timeRangeInUrl);
        }
        this.refreshInterval.set(refreshInterval || 0);
        this._changeDetectorRef.detectChanges();
        this.isLoading.set(false);
      });
  }

  onDashboardNameChange(name: string) {
    const dashboard = this.dashboard()!;
    if (!name) {
      dashboard.attributes!['name'] = 'Unnamed';
      return;
    }
    dashboard.attributes!['name'] = name;
    this._dashboardService.saveDashboard(dashboard).subscribe();
  }

  handleDashboardDescriptionChange(description: string) {
    let dashboard = this.dashboard()!;
    dashboard.description = description;
    this._dashboardService.saveDashboard(dashboard).subscribe();
  }

  extractTimeRangeFromUrl(): TimeRangePickerSelection | undefined {
    const urlParams = this._urlParamsService.collectUrlParams();
    if (urlParams.timeRange) {
      if (urlParams.timeRange.type === 'RELATIVE') {
        // find the selection with label
        urlParams.timeRange = this.findRelativeTimeOption(urlParams.timeRange.relativeSelection!.timeInMs);
      }
      return urlParams.timeRange;
    }
    return undefined;
  }

  extractUrlParams(): UrlParams {
    const urlParams = this._urlParamsService.collectUrlParams();
    if (urlParams.timeRange && urlParams.timeRange.type === 'RELATIVE') {
      // find the selection with label
      urlParams.timeRange = this.findRelativeTimeOption(urlParams.timeRange.relativeSelection!.timeInMs);
    }
    return { timeRange: urlParams.timeRange, refreshInterval: urlParams.refreshInterval };
  }
}
