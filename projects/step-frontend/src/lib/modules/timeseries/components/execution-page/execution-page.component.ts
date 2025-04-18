import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  ResolutionPickerComponent,
  TimeSeriesConfig,
  TimeSeriesContextsFactory,
} from '../../modules/_common';
import { DashboardFilterBarComponent } from '../../modules/filter-bar';
import { ChartDashletComponent } from '../chart-dashlet/chart-dashlet.component';
import { TableDashletComponent } from '../table-dashlet/table-dashlet.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import {
  AsyncTasksService,
  AuthService,
  Execution,
  ExecutionViewMode,
  ExecutionViewModeService,
  pollAsyncTask,
  TimeRange,
  TimeSeriesService,
} from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, Observable, pairwise, take } from 'rxjs';
import { TimeRangePickerSelection } from '../../modules/_common/types/time-selection/time-range-picker-selection';
import { DashboardViewSettingsBtnLocation } from '../dashboard/dashboard-view-settings-btn-location';
import { TimeRangePickerComponent } from '../../modules/_common/components/time-range-picker/time-range-picker.component';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DashboardUrlParamsService } from '../../modules/_common/injectables/dashboard-url-params.service';

@Component({
  selector: 'step-execution-page',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    DashboardFilterBarComponent,
    ChartDashletComponent,
    ResolutionPickerComponent,
    TimeRangePickerComponent,
    TableDashletComponent,
    DashboardComponent,
  ],
})
export class ExecutionPageComponent implements OnInit, OnChanges {
  @Input() execution!: Execution;
  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

  @Output() timeRangePickerChange = new EventEmitter<TimeRangePickerSelection>();

  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  protected _executionViewModeService = inject(ExecutionViewModeService);
  protected executionMode?: Observable<ExecutionViewMode>;
  private _urlParamsService = inject(DashboardUrlParamsService);

  dashboardId!: string;
  hiddenFilters: FilterBarItem[] = [];
  executionRange?: Partial<TimeRange>;

  executionHasToBeBuilt = false;
  executionCreationInProgress = false;
  isInitialized = false;

  private timeSeriesService = inject(TimeSeriesService);
  private _asyncTaskService = inject(AsyncTasksService);

  private _destroyRef = inject(DestroyRef);

  readonly SETTINGS_BTN_LOCATION = DashboardViewSettingsBtnLocation;

  private _router = inject(Router);

  ngOnInit(): void {
    if (!this.execution) {
      throw new Error('Execution input is mandatory');
    }
    this.dashboardId = this._authService.getConf()!.miscParams![TimeSeriesConfig.PARAM_KEY_EXECUTION_DASHBOARD_ID];
    if (!this.dashboardId) {
      throw new Error('Execution dashboard id is not present on conf');
    }

    this.hiddenFilters = [
      {
        attributeName: 'eId',
        label: 'Execution',
        isLocked: true,
        exactMatch: true,
        freeTextValues: [],
        searchEntities: [{ searchValue: this.execution.id!, entity: this.execution }],
        type: FilterBarItemType.EXECUTION,
      },
    ];
    this.executionRange = this.getExecutionRange(this.execution);
    this.timeSeriesService.checkTimeSeries(this.execution!.id!).subscribe((exists) => {
      if (exists) {
        this.isInitialized = true;
      } else {
        this.executionHasToBeBuilt = true;
      }
    });
    this.subscribeToUrlNavigation();
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
        this.isInitialized = false;
        let timeRange = this._urlParamsService.collectUrlParams().timeRange;
        this._changeDetectorRef.detectChanges();
        if (timeRange) {
          this.timeRangePickerChange.next(timeRange!);
        }
        this.isInitialized = true;
      });
  }

  getExecutionRange(execution: Execution): Partial<TimeRange> {
    return { from: execution.startTime, to: execution.endTime };
  }

  ngOnChanges(changes: SimpleChanges): void {
    const executionChange = changes['execution'];
    if (executionChange?.currentValue !== executionChange?.previousValue && !executionChange?.firstChange) {
      this.executionMode = this._executionViewModeService.getExecutionMode(this.execution);
      this.executionRange = this.getExecutionRange(this.execution);
      this.dashboard?.refresh();
    }
  }

  rebuildTimeSeries() {
    this.executionCreationInProgress = true;
    this.timeSeriesService
      .rebuildTimeSeries({ executionId: this.execution.id })
      .pipe(pollAsyncTask(this._asyncTaskService), takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (task) => {
          if (task.ready) {
            this.executionCreationInProgress = false;
            this.executionHasToBeBuilt = false;
            this.isInitialized = true;
          } else {
            console.error('The task is not finished yet');
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  protected readonly ExecutionViewMode = ExecutionViewMode;
}
