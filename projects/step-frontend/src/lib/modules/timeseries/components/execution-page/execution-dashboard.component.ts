import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  TimeSeriesConfig,
  TimeSeriesContext,
} from '../../modules/_common';
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
import { finalize, Observable } from 'rxjs';

@Component({
  selector: 'step-execution-dashboard',
  templateUrl: './execution-dashboard.component.html',
  styleUrls: ['./execution-dashboard.component.scss'],
  imports: [COMMON_IMPORTS, DashboardComponent],
  standalone: true,
})
export class ExecutionDashboardComponent implements OnInit, OnChanges {
  readonly execution = input.required<Execution>();
  readonly initialTimeRange = input.required<TimeRange>();
  readonly fullRangeUpdateRequest = output<TimeRange>();

  readonly contextSettingsChanged = output<TimeSeriesContext>(); // used to detect any change, useful for url updates
  readonly contextSettingsInit = output<TimeSeriesContext>(); // emit only first time when the context is created

  private readonly dashboardComponent = viewChild('dashboardComponent', { read: DashboardComponent });

  private readonly _authService = inject(AuthService);
  protected readonly _executionViewModeService = inject(ExecutionViewModeService);
  protected executionMode?: Observable<ExecutionViewMode>;

  dashboardId!: string;
  hiddenFilters: FilterBarItem[] = [];
  executionRange?: Partial<TimeRange>;

  executionHasToBeBuilt = false;
  executionCreationInProgress = false;
  timeSeriesCheckInProgress = true;
  isInitialized = false;

  private readonly _timeSeriesService = inject(TimeSeriesService);
  private readonly _asyncTaskService = inject(AsyncTasksService);

  private readonly _destroyRef = inject(DestroyRef);

  public updateFullTimeRange(
    timeRange: TimeRange,
    opts: { actionType: 'manual' | 'auto'; resetSelection?: boolean },
  ): void {
    this.dashboardComponent()?.updateFullTimeRange(timeRange, opts);
  }

  ngOnInit(): void {
    if (!this.execution) {
      throw new Error('Execution input is mandatory');
    }
    this.dashboardId = this._authService.getConf()!.miscParams![TimeSeriesConfig.PARAM_KEY_EXECUTION_DASHBOARD_ID];
    if (!this.dashboardId) {
      throw new Error('Execution dashboard id is not present on conf');
    }
    const executionId: string = this.execution().id!;

    this.hiddenFilters = [
      {
        attributeName: 'eId',
        label: 'Execution',
        isLocked: true,
        exactMatch: true,
        freeTextValues: [],
        searchEntities: [{ searchValue: executionId, entity: this.execution() }],
        type: FilterBarItemType.EXECUTION,
      },
    ];
    this.executionRange = this.getExecutionRange(this.execution());
    this._timeSeriesService
      .checkTimeSeries(executionId!)
      .pipe(finalize(() => (this.timeSeriesCheckInProgress = false)))
      .subscribe((exists) => {
        if (exists) {
          this.isInitialized = true;
        } else {
          this.executionHasToBeBuilt = true;
        }
      });
  }

  public getSelectedTimeRange(): TimeRange {
    return this.dashboardComponent()!.getSelectedTimeRange();
  }

  getExecutionRange(execution: Execution): TimeRange {
    return { from: execution.startTime!, to: execution.endTime || new Date().getTime() };
  }

  ngOnChanges(changes: SimpleChanges): void {
    // we do the refresh based on execution change
    const executionChange = changes['execution'];
    if (executionChange?.currentValue !== executionChange?.previousValue && !executionChange?.firstChange) {
      this.executionMode = this._executionViewModeService.getExecutionMode(this.execution());
      // const timeRange = this.getExecutionRange(this.execution());
      // this.dashboardComponent()?.updateFullTimeRange(timeRange, { actionType: 'auto' });
    }
  }

  rebuildTimeSeries(): void {
    this.executionCreationInProgress = true;
    this._timeSeriesService
      .rebuildTimeSeries({ executionId: this.execution().id })
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
}
