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
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { StandaloneChartComponent } from '../standalone-chart/standalone-chart.component';
import { TimeRangePickerComponent } from '../../modules/_common/components/time-range-picker/time-range-picker.component';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, filter, Observable, of, switchMap } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TimeRangePickerSelection } from '../../modules/_common/types/time-selection/time-range-picker-selection';
import { transform } from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { AuthService, DashboardsService, DashboardView } from '@exense/step-core';
import { DashboardUrlParamsService } from '../../modules/_common/injectables/dashboard-url-params.service';

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
  dashboardIdInternalSignal = signal<string | undefined>(undefined);

  dashboardIdEffect = effect(() => {
    let dashboardId = this.dashboardId();
    if (dashboardId) {
      this.dashboardIdInternal = dashboardId;
      this.dashboardIdInternalSignal.set(dashboardId);
    }
  });

  dashboardId$: Observable<string> = toObservable(this.dashboardIdInternalSignal).pipe(
    filter((id): id is string => !!id),
  );

  dashboard$: Observable<DashboardView> = this.dashboardId$.pipe(
    switchMap((id) => this._dashboardService.getDashboardById(id)),
  );

  dashboard: Signal<DashboardView | undefined> = toSignal(this.dashboard$);

  dashboardEffect = effect(() => {
    const dashboard = this.dashboard();
    if (dashboard && this.activeTimeRangeSelection() === undefined) {
      this.activeTimeRangeSelection.set(dashboard!.timeRange);
    }
  });

  hasWritePermission = this._authService.hasRight('dashboard-write');

  timeRange = computed(() => {
    const pickerSelection = this.activeTimeRangeSelection();
    if (pickerSelection) {
      return TimeSeriesUtils.convertSelectionToTimeRange(pickerSelection);
    } else {
      return undefined;
    }
  });

  dashboardIdInternal?: string;

  ngOnInit(): void {
    const urlParams = this._urlParamsService.collectUrlParams();
    if (urlParams.timeRange) {
      if (urlParams.timeRange.type === 'RELATIVE') {
        // find the selection with label
        urlParams.timeRange = this.findRelativeTimeOption(urlParams.timeRange.relativeSelection!.timeInMs);
      }
      this.activeTimeRangeSelection.set(urlParams.timeRange!);
    }
    if (!this.dashboardId()) {
      this._route.paramMap.subscribe((params) => {
        const id: string = params.get('id')!;
        if (!id) {
          throw new Error('Dashboard id not present');
        }
        this.dashboardIdInternal = id;
        this.dashboardIdInternalSignal.set(id);
      });
    }
    this.subscribeToUrlNavigation();
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

  onDashboardNameChange(name: string) {
    let dashboard = this.dashboard()!;
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
}
