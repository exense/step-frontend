import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AJS_MODULE,
  AsyncTasksService,
  AsyncTaskStatusResource,
  DashboardService,
  ExecutionsService,
  pollAsyncTask,
} from '@exense/step-core';
import { TimeSeriesConfig } from '../time-series.config';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/performance-view-settings';
import { TimeSeriesService } from '../time-series.service';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { delay, map } from 'rxjs';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  @Input() executionId!: string;

  executionInProgress = false;
  refreshEnabled = false;
  performanceViewSettings: PerformanceViewSettings | undefined;
  intervalExecution: any;
  intervalShouldBeCanceled = false;

  executionHasToBeBuilt = false;
  migrationInProgress = false;

  // this is just for running executions
  refreshIntervals: RefreshInterval[] = [
    { label: '5 Sec', value: 5000 },
    { label: '30 Sec', value: 30 * 1000 },
    { label: '1 Min', value: 60 * 1000 },
    { label: '5 Min', value: 5 * 60 * 1000 },
    { label: '30 Min', value: 30 * 60 * 1000 },
    { label: 'Off', value: 0 },
  ];
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

  init() {
    this.executionService.getExecutionById(this.executionId).subscribe((execution) => {
      let startTime = execution.startTime! - (execution.startTime! % TimeSeriesConfig.RESOLUTION);
      // let now = new Date().getTime();
      let endTime = undefined;
      if (execution.endTime) {
        // execution is over
        endTime = execution.endTime; // + (TimeSeriesConfig.RESOLUTION - (execution.endTime % TimeSeriesConfig.RESOLUTION)); // not sure if needed
      } else {
        this.executionInProgress = true;
        endTime = new Date().getTime();
      }
      this.performanceViewSettings = {
        contextId: this.executionId,
        startTime: startTime,
        endTime: endTime,
        contextualFilters: { eId: this.executionId },
      };
      if (this.executionInProgress) {
        this.startRefreshInterval(this.selectedRefreshInterval.value);
        this.refreshEnabled = true;
      }
    });
  }

  rebuildTimeSeries() {
    this.migrationInProgress = true;
    this.timeSeriesService
      .rebuildTimeSeries(this.executionId)
      .pipe(pollAsyncTask(this._asyncTaskService))
      .subscribe(
        (task) => {
          if (task.ready) {
            this.migrationInProgress = false;
            this.executionHasToBeBuilt = false;
            this.init();
          } else {
            console.error('The task is not finished yet');
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  changeRefreshInterval(newInterval: RefreshInterval) {
    if (newInterval.value) {
      if (this.selectedRefreshInterval.value === newInterval.value) {
        return;
      }
      this.refreshEnabled = true;
      clearInterval(this.intervalExecution);
      this.startRefreshInterval(newInterval.value);
    } else {
      // we need to stop it
      this.refreshEnabled = false;
      clearInterval(this.intervalExecution);
    }
    this.selectedRefreshInterval = newInterval;
  }

  startRefreshInterval(interval: number) {
    this.intervalExecution = setInterval(() => {
      let now = new Date().getTime();
      if (this.intervalShouldBeCanceled) {
        clearTimeout(this.intervalExecution);
        // the end time is updated already.
      } else {
        this.performanceViewSettings!.endTime =
          now - (this.intervalShouldBeCanceled ? 0 : TimeSeriesConfig.RESOLUTION * 5); // if the execution is not ended, we don't fetch until the end.
      }

      // this.findRequest.start = lastEnd - ((lastEnd - this.executionStart) % this.findRequest.intervalSize);
      //   this.findRequest.end = now;
      const timeSelection = this.performanceView.getTimeRangeSelection();
      if (timeSelection.type === RangeSelectionType.RELATIVE && timeSelection.relativeSelection) {
        let from = now - timeSelection.relativeSelection.timeInMs;
        timeSelection.absoluteSelection = { from: from, to: now };
      }
      //   this.findRequest.numberOfBuckets = this.calculateIdealNumberOfBuckets(
      //     this.findRequest.start,
      //     this.findRequest.end
      //   );
      this.performanceView.reconstructAllCharts();
      this.executionService.getExecutionById(this.executionId).subscribe((details) => {
        if (details.endTime) {
          this.performanceViewSettings!.endTime = details.endTime;
          this.intervalShouldBeCanceled = true;
          this.executionInProgress = false;
        }
      });
    }, interval);
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmExecutionLink(this.executionId));
  }

  ngOnDestroy(): void {
    this.contextsFactory.destroyContext(this.executionId);
    if (this.intervalExecution) {
      clearInterval(this.intervalExecution);
    }
  }
}

interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
