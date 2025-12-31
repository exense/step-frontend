import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
  ViewChild,
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
import { Observable } from 'rxjs';

@Component({
  selector: 'step-execution-dashboard',
  templateUrl: './execution-dashboard.component.html',
  styleUrls: ['./execution-dashboard.component.scss'],
  imports: [COMMON_IMPORTS, DashboardComponent],
  standalone: true,
})
export class ExecutionDashboardComponent implements OnInit, OnChanges {
  execution = input.required<Execution>();
  timeRange = input.required<TimeRange>();
  readonly fullRangeUpdateRequest = output<TimeRange>();

  readonly contextSettingsChanged = output<TimeSeriesContext>(); // used to detect any change, useful for url updates
  readonly contextSettingsInit = output<TimeSeriesContext>(); // emit only first time when the context is created

  @ViewChild(DashboardComponent) dashboard!: DashboardComponent;

  private _authService = inject(AuthService);
  protected _executionViewModeService = inject(ExecutionViewModeService);
  protected executionMode?: Observable<ExecutionViewMode>;

  dashboardId!: string;
  hiddenFilters: FilterBarItem[] = [];
  executionRange?: Partial<TimeRange>;

  executionHasToBeBuilt = false;
  executionCreationInProgress = false;
  isInitialized = false;

  private timeSeriesService = inject(TimeSeriesService);
  private _asyncTaskService = inject(AsyncTasksService);

  private _destroyRef = inject(DestroyRef);

  public refresh() {}

  public updateFullTimeRange(
    timeRange: TimeRange,
    opts: { actionType: 'manual' | 'auto'; resetSelection?: boolean },
  ): void {
    // this.dashboard.updateFullTimeRange()
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
    this.timeSeriesService.checkTimeSeries(executionId!).subscribe((exists) => {
      if (exists) {
        this.isInitialized = true;
      } else {
        this.executionHasToBeBuilt = true;
      }
    });
  }

  public getSelectedTimeRange() {
    return this.dashboard.getSelectedTimeRange();
  }

  getExecutionRange(execution: Execution): Partial<TimeRange> {
    return { from: execution.startTime, to: execution.endTime };
  }

  ngOnChanges(changes: SimpleChanges): void {
    const executionChange = changes['execution'];
    if (executionChange?.currentValue !== executionChange?.previousValue && !executionChange?.firstChange) {
      this.executionMode = this._executionViewModeService.getExecutionMode(this.execution());
      this.executionRange = this.getExecutionRange(this.execution());
      // this.dashboard?.refresh();
      // TODO
    }
  }

  rebuildTimeSeries() {
    this.executionCreationInProgress = true;
    this.timeSeriesService
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
