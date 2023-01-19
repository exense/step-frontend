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
import { Subject, Subscription, takeUntil, timer } from 'rxjs';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesConfig } from '../time-series.config';
import { MatMenuTrigger } from '@angular/material/menu';
import { TimeSeriesDashboardSettings } from '../dashboard/model/ts-dashboard-settings';
import { TimeSeriesDashboardComponent } from '../dashboard/time-series-dashboard.component';
import { UrlUtils } from '../util/url-utils';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  terminator$ = new Subject<void>();

  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  @Input() executionId!: string;
  private execution: Execution | undefined;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };

  executionInProgress = false;
  performanceViewSettings: PerformanceViewSettings | undefined;

  executionHasToBeBuilt = false;
  migrationInProgress = false;

  updateSubscription = new Subscription();

  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  stopInterval$ = new Subject();

  // this is just for running executions
  refreshIntervals: RefreshInterval[] = TimeSeriesConfig.AUTO_REFRESH_INTERVALS;
  selectedRefreshInterval: RefreshInterval = this.refreshIntervals[0];

  constructor(
    private timeSeriesService: TimeSeriesService,
    private contextsFactory: TimeSeriesContextsFactory,
    private executionService: ExecutionsService,
    private dashboardService: DashboardService,
    private _asyncTaskService: AsyncTasksService
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
    let start = this.execution!.startTime!;
    const end = this.execution!.endTime! || new Date().getTime();
    let range: TSTimeRange = { from: 0, to: 0 };
    switch (selection.type) {
      case RangeSelectionType.FULL:
        range = { from: start, to: end };
        break;
      case RangeSelectionType.ABSOLUTE:
        range = selection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        range = { from: end - selection.relativeSelection!.timeInMs, to: end };
        break;
    }
    this.dashboard.updateRange(range);
  }

  init() {
    this.executionService.getExecutionById(this.executionId).subscribe((execution) => {
      this.execution = execution;
      const startTime = execution.startTime!;
      const endTime = execution.endTime ? execution.endTime : new Date().getTime();
      if (!execution.endTime) {
        this.executionInProgress = true;
      }
      let urlParams = UrlUtils.getURLParams(window.location.href);
      this.dashboardSettings = {
        contextId: this.executionId,
        includeThreadGroupChart: true,
        timeRange: { from: startTime, to: endTime },
        contextualFilters: { ...urlParams, eId: this.executionId },
      };
      if (this.executionInProgress) {
        setTimeout(() => this.startInterval(), this.selectedRefreshInterval.value);
      }
    });
  }

  startInterval(delay = 0) {
    this.stopInterval$.next(null); // make sure to stop it if it's still running
    timer(delay, this.selectedRefreshInterval.value)
      .pipe(takeUntil(this.stopInterval$), takeUntil(this.terminator$))
      .subscribe(() => this.triggerRefresh());
  }

  /**
   * This will be the public method called from the outside of this component.
   */
  triggerRefresh() {
    let now = new Date().getTime();
    let details = this.execution!;
    let selection: TSTimeRange;
    let newFullRange: TSTimeRange;
    switch (this.timeRangeSelection.type) {
      case RangeSelectionType.FULL:
        newFullRange = { from: details.startTime!, to: details.endTime || now - 5000 };
        selection = newFullRange;
        break;
      case RangeSelectionType.ABSOLUTE:
        newFullRange = this.timeRangeSelection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        let end = details.endTime || now;
        newFullRange = { from: end - this.timeRangeSelection.relativeSelection!.timeInMs!, to: end };
        break;
    }
    this.dashboard.refresh(newFullRange);
  }

  rebuildTimeSeries() {
    this.migrationInProgress = true;
    this.timeSeriesService
      .rebuildTimeSeries(this.executionId)
      .pipe(pollAsyncTask(this._asyncTaskService), takeUntil(this.terminator$))
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
    this.stopInterval$.next(null);
    if (newInterval.value) {
      this.startInterval();
    }
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmExecutionLink(this.executionId));
  }

  ngOnDestroy(): void {
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
