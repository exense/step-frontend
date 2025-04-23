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
  untracked,
  WritableSignal,
} from '@angular/core';
import {
  COMMON_IMPORTS,
  ResolutionPickerComponent,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesUtils,
} from '../../modules/_common';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { StandaloneChartComponent } from '../standalone-chart/standalone-chart.component';
import { TimeRangePickerComponent } from '../../modules/_common/components/time-range-picker/time-range-picker.component';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, Observable, pairwise, shareReplay, switchMap, take } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TimeRangePickerSelection } from '../../modules/_common/types/time-selection/time-range-picker-selection';
import { AuthService, DashboardsService, DashboardView, TimeRange } from '@exense/step-core';
import { DashboardUrlParamsService } from '../../modules/_common/injectables/dashboard-url-params.service';

interface UrlParams {
  timeRange?: TimeRangePickerSelection;
  refreshInterval?: number;
}

@Component({
  selector: 'step-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  standalone: true,
  providers: [DashboardUrlParamsService],
  imports: [
    COMMON_IMPORTS,
    DashboardFilterBarComponent,
    ChartDashletComponent,
    ResolutionPickerComponent,
    TimeRangePickerComponent,
    TableDashletComponent,
    DashboardComponent,
    StandaloneChartComponent,
    MatProgressSpinner,
  ],
})
export class DashboardPageComponent implements OnInit {
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _router: Router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _dashboardService = inject(DashboardsService);
  private _authService = inject(AuthService);
  private _urlParamsService = inject(DashboardUrlParamsService);

  readonly timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  activeTimeRangeSelection: WritableSignal<TimeRangePickerSelection | undefined> = signal(undefined);

  dashboardId = input<string>(); // optional, otherwise it will be taken from url
  showRefreshToggle = input<boolean>(true);
  dashboardIdInternalSignal = signal<string | undefined>(undefined);
  refreshInterval = signal<number>(0);

  dashboardIdEffect = effect(() => {
    let dashboardId = this.dashboardId();
    if (dashboardId) {
      untracked(() => {
        this.dashboardIdInternalSignal.set(dashboardId);
      });
    }
  });

  dashboardId$: Observable<string> = toObservable(this.dashboardIdInternalSignal).pipe(
    filter((id): id is string => !!id),
  );

  dashboard$: Observable<DashboardView> = this.dashboardId$.pipe(
    switchMap((id) => this._dashboardService.getDashboardById(id)),
    shareReplay(1),
  );

  dashboard: Signal<DashboardView | undefined> = toSignal(this.dashboard$);

  hasWritePermission = this._authService.hasRight('dashboard-write');

  isLoading = false;

  timeRange = computed<TimeRange | undefined>(() => {
    const pickerSelection = this.activeTimeRangeSelection();
    if (pickerSelection) {
      return TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection);
    } else {
      return undefined;
    }
  });

  ngOnInit(): void {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('Navigation started:', event.url);
      }
    });
    const urlParams = this.extractUrlParams();
    if (urlParams.timeRange) {
      this.activeTimeRangeSelection.set(urlParams.timeRange);
    }
    console.log(urlParams.refreshInterval);
    this.refreshInterval.set(urlParams.refreshInterval || 0);
    if (!this.dashboardId()) {
      this._route.paramMap.subscribe((params) => {
        const id: string = params.get('id')!;
        if (!id) {
          throw new Error('Dashboard id not present');
        }
        this.dashboardIdInternalSignal.set(id);
      });
    }
    this.dashboard$.pipe(take(1)).subscribe((dashboard) => {
      if (dashboard && this.activeTimeRangeSelection() === undefined) {
        if (dashboard!.timeRange.type === 'RELATIVE' && !dashboard!.timeRange.relativeSelection?.label) {
          dashboard.timeRange = this.findRelativeTimeOption(dashboard!.timeRange.relativeSelection!.timeInMs);
        }
        this.activeTimeRangeSelection.set(dashboard!.timeRange);
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

  handleRefreshIntervalChange(interval: number) {
    this._urlParamsService.updateRefreshInterval(interval, false);
  }

  handleFullRangeChanged(range: TimeRange) {
    this.activeTimeRangeSelection.set({ type: 'ABSOLUTE', absoluteSelection: range });
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
        pairwise(),
        filter(
          ([prev, curr]) =>
            prev instanceof NavigationStart && curr instanceof NavigationEnd && prev.navigationTrigger === 'popstate',
        ),
      )
      .subscribe(() => {
        this.isLoading = true;
        const timeRangeInUrl = this.extractTimeRangeFromUrl();
        let refreshInterval = this.extractUrlParams().refreshInterval;
        if (timeRangeInUrl) {
          this.activeTimeRangeSelection.set(timeRangeInUrl);
        }
        this.refreshInterval.set(refreshInterval || 0);
        this._changeDetectorRef.detectChanges();
        this.isLoading = false;
      });
  }

  onDashboardNameChange(name: string) {
    const dashboard = this.dashboard()!;
    if (!name) {
      dashboard.attributes!['name'] = 'Unnamed';
      return;
    }
    dashboard.attributes!['name'] = name;
    // const modifiedDashboard = this.editMode ? this.dashboardBackup! : this.dashboard;
    // this._dashboardService.saveDashboard(modifiedDashboard).subscribe();
  }

  handleDashboardDescriptionChange(description: string) {
    // const modifiedDashboard = this.editMode ? this.dashboardBackup! : this.dashboard;
    // modifiedDashboard.description = description;
    // this._dashboardService.saveDashboard(modifiedDashboard).subscribe();
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
    console.log(urlParams);
    if (urlParams.timeRange && urlParams.timeRange.type === 'RELATIVE') {
      // find the selection with label
      urlParams.timeRange = this.findRelativeTimeOption(urlParams.timeRange.relativeSelection!.timeInMs);
    }
    return { timeRange: urlParams.timeRange, refreshInterval: urlParams.refreshInterval };
  }
}
