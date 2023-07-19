import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AJS_MODULE,
  AsyncTasksService,
  DashboardService,
  Execution,
  ExecutionsService,
  pollAsyncTask,
  TimeSeriesService,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { Subject, Subscription, takeUntil, timer } from 'rxjs';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesConfig } from '../time-series.config';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeSeriesDashboardSettings } from '../dashboard/model/ts-dashboard-settings';
import { TimeSeriesDashboardComponent } from '../dashboard/time-series-dashboard.component';
import { FilterBarItemType } from '../performance-view/filter-bar/model/ts-filter-item';
import { TsUtils } from '../util/ts-utils';
import { TimeSeriesUtils } from '../time-series-utils';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './ts-execution-page.component.html',
  styleUrls: ['./ts-execution-page.component.scss'],
})
export class ExecutionPerformanceComponent implements OnInit, OnDestroy, OnChanges {
  terminator$ = new Subject<void>();

  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  @Input() executionId!: string;
  @Input() executionInput: Execution | undefined;
  execution: Execution | undefined;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };

  performanceViewSettings: PerformanceViewSettings | undefined;

  executionHasToBeBuilt = false;
  migrationInProgress = false;

  updateSubscription = new Subscription();

  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  constructor(
    private timeSeriesService: TimeSeriesService,
    private executionService: ExecutionsService,
    private dashboardService: DashboardService,
    private _asyncTaskService: AsyncTasksService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.executionId) {
      throw new Error('ExecutionId parameter is not present');
    }
    this.timeSeriesService.checkTimeSeries(this.executionId).subscribe((exists) => {
      if (!exists) {
        this.executionHasToBeBuilt = true;
      }
    });
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.dashboard.updateRange(TimeSeriesUtils.calculateFullTimeRange(this.execution!, this.timeRangeSelection));
  }

  // auto-refresh goes through here
  ngOnChanges(changes: SimpleChanges): void {
    let executionChange = changes['executionInput'];
    if (!executionChange) {
      return;
    }
    let currentExecution = executionChange.currentValue;
    if (!this.execution && currentExecution) {
      // it is first change
      this.initDashboard(currentExecution);
      this.cd.detectChanges();
    } else {
      this.dashboard.refresh(TimeSeriesUtils.calculateFullTimeRange(this.execution!, this.timeRangeSelection));
    }
  }

  initDashboard(execution: Execution) {
    this.execution = execution;
    const startTime = execution.startTime!;
    const endTime = execution.endTime ? execution.endTime : new Date().getTime();
    let urlParams = TsUtils.getURLParams(window.location.href);
    const timeRangeOptions = TimeSeriesConfig.EXECUTION_PAGE_TIME_SELECTION_OPTIONS;
    this.dashboardSettings = {
      contextId: this.executionId,
      execution: execution,
      includeThreadGroupChart: true,
      timeRange: { from: startTime, to: endTime },
      timeRangeOptions: timeRangeOptions,
      activeTimeRange: timeRangeOptions[timeRangeOptions.length - 1],
      contextualFilters: { ...urlParams, eId: this.executionId },
      showContextualFilters: false,
      filterOptions: [
        {
          label: 'Status',
          attributeName: 'rnStatus',
          type: FilterBarItemType.OPTIONS,
          textValues: [
            { value: 'PASSED' },
            { value: 'FAILED' },
            { value: 'TECHNICAL_ERROR' },
            { value: 'INTERRUPTED' },
          ],
          isLocked: true,
        },
        {
          label: 'Type',
          attributeName: 'type',
          type: FilterBarItemType.OPTIONS,
          textValues: [{ value: 'keyword' }, { value: 'custom' }],
          isLocked: true,
        },
        {
          label: 'Name',
          attributeName: 'name',
          type: FilterBarItemType.FREE_TEXT,
          isLocked: true,
        },
      ],
    };
  }

  rebuildTimeSeries() {
    this.migrationInProgress = true;
    this.timeSeriesService
      .rebuildTimeSeries({ executionId: this.executionId })
      .pipe(pollAsyncTask(this._asyncTaskService), takeUntil(this.terminator$))
      .subscribe({
        next: (task) => {
          if (task.ready) {
            this.migrationInProgress = false;
            this.executionHasToBeBuilt = false;
          } else {
            console.error('The task is not finished yet');
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPerformance', downgradeComponent({ component: ExecutionPerformanceComponent }));
