import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AJS_MODULE,
  AsyncTasksService,
  DashboardService,
  Execution,
  ExecutionsService,
  pollAsyncTask,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { TimeSeriesService } from '../time-series.service';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { forkJoin, Observable, of, Subject, Subscription, switchMap, tap, timer } from 'rxjs';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesContext } from '../time-series-context';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  readonly ONE_HOUR_MS = 3600 * 1000;
  private readonly RUNNING_EXECUTION_END_TIME_BUFFER = 5000; // if the exec is running, we don't grab the last 5 seconds

  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  @Input() executionId!: string;
  private execution: Execution | undefined;
  context!: TimeSeriesContext;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };

  private dashboardInitComplete$ = new Subject<void>();

  executionInProgress = false;
  performanceViewSettings: PerformanceViewSettings | undefined;
  intervalShouldBeCanceled = false;

  executionHasToBeBuilt = false;
  migrationInProgress = false;

  updatingSubscription = new Subscription();

  // this is just for running executions
  refreshIntervals: RefreshInterval[] = [
    { label: '5 Sec', value: 5000 },
    { label: '30 Sec', value: 30 * 1000 },
    { label: '1 Min', value: 60 * 1000 },
    { label: '5 Min', value: 5 * 60 * 1000 },
    { label: '30 Min', value: 30 * 60 * 1000 },
    { label: 'Off', value: 0 },
  ];
  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 5 Minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    { label: 'Last 30 Minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
  ];
  selectedRefreshInterval: RefreshInterval = this.refreshIntervals[0];

  constructor(
    private timeSeriesService: TimeSeriesService,
    private contextsFactory: TimeSeriesContextsFactory,
    private executionService: ExecutionsService,
    private dashboardService: DashboardService,
    private _asyncTaskService: AsyncTasksService,
    private contextFactory: TimeSeriesContextsFactory
  ) {}

  ngOnInit(): void {
    if (!this.executionId) {
      throw new Error('ExecutionId parameter is not present');
    }
    this.timeSeriesService.timeSeriesIsBuilt(this.executionId).subscribe((exists) => {
      if (exists) {
        this.init();
      } else {
        this.executionHasToBeBuilt = true;
      }
    });
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    if (this.executionInProgress) {
      console.log('execution is in progress');
    } else {
      this.onEndedExecutionTimeRangeChange(selection);
    }
  }

  onEndedExecutionTimeRangeChange(selection: TimeRangePickerSelection) {
    let execution = this.execution!;
    let newInterval: TSTimeRange;
    switch (selection.type) {
      case RangeSelectionType.FULL:
        newInterval = { from: execution.startTime!, to: execution.endTime! };
        break;
      case RangeSelectionType.ABSOLUTE:
        newInterval = selection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        const end = execution.endTime!;
        let from = Math.max(execution.startTime!, end - selection.relativeSelection!.timeInMs);
        newInterval = { from: from, to: end };
    }
    this.context.updateFullRange(newInterval);
    // this.performanceView.updateFullRange(newInterval);
  }

  onPerformanceViewInitComplete() {
    this.dashboardInitComplete$.next();
    this.dashboardInitComplete$.complete();
  }

  onPerformanceViewUpdateComplete() {
    // this.dashboardInitComplete.next();
  }

  init() {
    this.executionService.getExecutionById(this.executionId).subscribe((execution) => {
      this.execution = execution;
      const startTime = execution.startTime!;
      const endTime = execution.endTime ? execution.endTime : new Date().getTime();
      this.context = this.contextFactory.createContext(execution.id!, { from: startTime, to: endTime });
      if (!execution.endTime) {
        this.executionInProgress = true;
      }

      this.performanceViewSettings = {
        contextId: this.executionId,
        timeRange: { from: startTime, to: endTime },
        contextualFilters: { eId: this.executionId },
        includeThreadGroupChart: true,
      };
      if (this.executionInProgress) {
        this.triggerNextUpdate(this.selectedRefreshInterval.value, this.dashboardInitComplete$);
      }
    });
  }

  rebuildTimeSeries() {
    this.migrationInProgress = true;
    this.timeSeriesService
      .rebuildTimeSeries(this.executionId)
      .pipe(pollAsyncTask(this._asyncTaskService))
      .subscribe({
        next: (task) => {
          if (task.ready) {
            this.migrationInProgress = false;
            this.executionHasToBeBuilt = false;
            this.init();
          } else {
            console.error('The task is not finished yet');
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  changeRefreshInterval(newInterval: RefreshInterval) {
    const oldInterval = this.selectedRefreshInterval;
    this.selectedRefreshInterval = newInterval;
    if (oldInterval.value === newInterval.value) {
      return;
    }
    if (newInterval.value) {
      this.updatingSubscription.unsubscribe();
      this.triggerNextUpdate(newInterval.value, of(undefined));
    }
  }

  triggerNextUpdate(delay: number, observableToWaitFor: Observable<unknown>) {
    this.updatingSubscription = forkJoin([timer(delay), observableToWaitFor])
      .pipe(
        tap(() => {
          const now = new Date().getTime();
          if (this.executionInProgress) {
            this.performanceViewSettings!.timeRange.to =
              now - (this.intervalShouldBeCanceled ? 0 : this.RUNNING_EXECUTION_END_TIME_BUFFER); // if the execution is not ended, we don't fetch until the end.
          }
          const timeSelection = this.timeRangeSelection;
          if (timeSelection.type === RangeSelectionType.RELATIVE && timeSelection.relativeSelection) {
            const from = now - timeSelection.relativeSelection.timeInMs;
            timeSelection.absoluteSelection = { from: from, to: now };
          }
        }),
        switchMap(() => {
          return this.executionService.getExecutionById(this.executionId);
        })
      )
      .subscribe((details) => {
        if (details.endTime) {
          this.performanceViewSettings!.timeRange.to = details.endTime;
          this.intervalShouldBeCanceled = true;
          this.executionInProgress = false;
          this.performanceView.refreshAllCharts(false, true).subscribe(() => {}); // don't re-trigger refresh
        } else {
          if (this.selectedRefreshInterval.value) {
            this.triggerNextUpdate(
              this.selectedRefreshInterval.value,
              this.performanceView.refreshAllCharts(false, true)
            ); // recursive call
          }
        }
      });
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmExecutionLink(this.executionId));
  }

  ngOnDestroy(): void {
    this.contextsFactory.destroyContext(this.executionId);
    this.dashboardInitComplete$.complete();
    this.updatingSubscription.unsubscribe();
  }
}

interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
