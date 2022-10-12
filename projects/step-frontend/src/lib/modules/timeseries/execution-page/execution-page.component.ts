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
import { first, forkJoin, Subject, timer } from 'rxjs';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  private readonly RUNNING_EXECUTION_END_TIME_BUFFER = 5000; // if the exec is running, we don't grab the last 5 seconds

  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;

  @Input() executionId!: string;

  dashboardUpdateCompleteSubject = new Subject<void>();

  executionInProgress = false;
  refreshEnabled = false;
  performanceViewSettings: PerformanceViewSettings | undefined;
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

  onPerformanceViewInitComplete() {
    this.dashboardUpdateCompleteSubject.next();
  }

  onPerformanceViewUpdateComplete() {
    this.dashboardUpdateCompleteSubject.next();
  }

  init() {
    this.executionService.getExecutionById(this.executionId).subscribe((execution) => {
      let startTime = execution.startTime!;
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
        this.triggerNextUpdate(this.selectedRefreshInterval.value);
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
      this.triggerNextUpdate(newInterval.value);
    } else {
      // we need to stop it
      this.refreshEnabled = false;
    }
    this.selectedRefreshInterval = newInterval;
  }

  triggerNextUpdate(delay: number) {
    forkJoin([timer(delay), this.dashboardUpdateCompleteSubject.pipe(first())]).subscribe(() => {
      let now = new Date().getTime();
      if (!this.intervalShouldBeCanceled) {
        this.performanceViewSettings!.endTime =
          now - (this.intervalShouldBeCanceled ? 0 : this.RUNNING_EXECUTION_END_TIME_BUFFER); // if the execution is not ended, we don't fetch until the end.
      }

      const timeSelection = this.performanceView.getTimeRangeSelection();
      if (timeSelection.type === RangeSelectionType.RELATIVE && timeSelection.relativeSelection) {
        let from = now - timeSelection.relativeSelection.timeInMs;
        timeSelection.absoluteSelection = { from: from, to: now };
      }
      this.executionService.getExecutionById(this.executionId).subscribe((details) => {
        if (details.endTime) {
          this.performanceViewSettings!.endTime = details.endTime;
          this.intervalShouldBeCanceled = true;
          this.executionInProgress = false;
        } else {
          this.triggerNextUpdate(this.selectedRefreshInterval.value);
        }
        this.performanceView.updateAllCharts();
      });
    });
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmExecutionLink(this.executionId));
  }

  ngOnDestroy(): void {
    this.contextsFactory.destroyContext(this.executionId);
  }
}

interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
