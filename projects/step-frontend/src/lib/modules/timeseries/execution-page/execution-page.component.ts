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
import { forkJoin, Observable, of, Subject, Subscription, switchMap, takeUntil, tap, timer } from 'rxjs';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesContext } from '../time-series-context';
import { TimeSeriesUtils } from '../time-series-utils';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  readonly ONE_HOUR_MS = 3600 * 1000;

  terminator$ = new Subject<void>();

  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  @Input() executionId!: string;
  private execution!: Execution;
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
    } else {
      this.onEndedExecutionTimeRangeChange(selection);
    }
  }

  onEndedExecutionTimeRangeChange(selection: TimeRangePickerSelection) {
    const execution = this.execution;
    let newFullRange: TSTimeRange;
    switch (selection.type) {
      case RangeSelectionType.FULL:
        newFullRange = { from: execution.startTime!, to: execution.endTime! };
        break;
      case RangeSelectionType.ABSOLUTE:
        newFullRange = selection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        const end = execution.endTime!;
        const from = Math.max(execution.startTime!, end - selection.relativeSelection!.timeInMs);
        newFullRange = { from: from, to: end };
    }
    this.context.updateSelectedRange(newFullRange, false);
    this.context.updateFullRange(newFullRange);
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
    // this.updatingSubscription.unsubscribe();
    this.terminator$.next();
    if (newInterval.value) {
      const delay = oldInterval.value === 0 ? 0 : newInterval.value;
      this.triggerNextUpdate(delay, of(undefined));
    }
  }

  triggerNextUpdate(delay: number, observableToWaitFor: Observable<unknown>) {
    this.updatingSubscription = forkJoin([timer(delay), observableToWaitFor])
      .pipe(
        switchMap(() => {
          return this.executionService.getExecutionById(this.executionId);
        }),
        takeUntil(this.terminator$)
      )
      .subscribe((details) => {
        const now = new Date().getTime();
        const isFullRangeSelected = this.context.isFullRangeSelected();
        const oldSelection = this.context.getSelectedTimeRange();
        let newFullRange: TSTimeRange;
        switch (this.timeRangeSelection.type) {
          case RangeSelectionType.FULL:
            newFullRange = { from: details.startTime!, to: details.endTime || now - 5000 };
            break;
          case RangeSelectionType.ABSOLUTE:
            newFullRange = this.timeRangeSelection.absoluteSelection!;
            break;
          case RangeSelectionType.RELATIVE:
            const end = details.endTime || now;
            newFullRange = { from: end - this.timeRangeSelection.relativeSelection!.timeInMs!, to: end };
            break;
        }
        // when the selection is 0, it will switch to full selection automatically
        const newSelection = isFullRangeSelected
          ? newFullRange
          : TimeSeriesUtils.cropInterval(newFullRange, oldSelection) || newFullRange;

        const updateDashboard$ = this.performanceView.updateDashboard({
          updateRanger: true,
          updateCharts: JSON.stringify(newSelection) !== JSON.stringify(oldSelection),
          fullTimeRange: newFullRange,
          selection: newSelection,
        });
        if (details.endTime) {
          this.intervalShouldBeCanceled = true;
          this.executionInProgress = false;
        } else {
          // the execution is not done yet
          this.triggerNextUpdate(this.selectedRefreshInterval.value, updateDashboard$); // recursive call
        }
      });
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmExecutionLink(this.executionId));
  }

  ngOnDestroy(): void {
    this.contextsFactory.destroyContext(this.executionId);
    this.dashboardInitComplete$.complete();
    // this.updatingSubscription.unsubscribe();
    this.terminator$.next();
    this.terminator$.complete();
  }
}

interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
