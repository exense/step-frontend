import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AJS_MODULE, ExecutionsService } from '@exense/step-core';
import { TimeSeriesConfig } from '../time-series.config';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/performance-view-settings';
import { TimeSeriesService } from '../time-series.service';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { FindBucketsRequest } from '../find-buckets-request';
import { TimeSeriesUtils } from '../time-series-utils';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TSRangerComponent } from '../ranger/ts-ranger.component';
import { TimeRangePicker } from '../time-selection/time-range-picker.component';
import { TSRangerSettings } from '../ranger/ts-ranger-settings';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';

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
    private executionService: ExecutionsService
  ) {}

  ngOnInit(): void {
    if (!this.executionId) {
      throw new Error('ExecutionId parameter is not present');
    }
    this.executionService.getExecutionById(this.executionId).subscribe((details) => {
      let startTime = details.startTime! - (details.startTime! % TimeSeriesConfig.RESOLUTION);
      // let now = new Date().getTime();
      let endTime = undefined;
      if (details.endTime) {
        // execution is over
        endTime = details.endTime + (TimeSeriesConfig.RESOLUTION - (details.endTime % TimeSeriesConfig.RESOLUTION)); // not sure if needed
      } else {
        endTime = new Date().getTime();
      }
      if (this.executionInProgress) {
        // this.startRefreshInterval(this.selectedRefreshInterval.value);
        // this.refreshEnabled = true;
      }

      this.performanceViewSettings = {
        contextId: this.executionId,
        startTime: startTime,
        endTime: endTime,
        contextualFilters: { eId: this.executionId },
      };
    });
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
    // this.intervalExecution = setInterval(() => {
    //   if (this.intervalShouldBeCanceled) {
    //     clearTimeout(this.intervalExecution);
    //   }
    //   let now = new Date().getTime();
    //   // this.findRequest.start = lastEnd - ((lastEnd - this.executionStart) % this.findRequest.intervalSize);
    //   this.findRequest.end = now;
    //   const timeSelection = this.performanceView.getTimeRangeSelection();
    //   if (timeSelection.type === RangeSelectionType.RELATIVE && timeSelection.relativeSelection) {
    //     let from = now - this.timeSelection.relativeSelection.timeInMs;
    //     timeSelection.absoluteSelection = { from: from, to: now };
    //   }
    //   this.findRequest.numberOfBuckets = this.calculateIdealNumberOfBuckets(
    //     this.findRequest.start,
    //     this.findRequest.end
    //   );
    //   this.performanceView.updateAllCharts();
    // this.timeSeriesService.getExecutionDetails(this.executionId).subscribe((details) => {
    //   if (details.endTime) {
    //     this.intervalShouldBeCanceled = true;
    //   }
    // });
    // }, interval);
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
