import { Component, Input, OnInit } from '@angular/core';
import { AJS_MODULE, ExecutionsService } from '@exense/step-core';
import { TimeSeriesConfig } from '../time-series.config';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from './performance-view-settings';

@Component({
  selector: 'step-execution-performance',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit {
  @Input() executionId!: string;

  performanceViewSettings: PerformanceViewSettings | undefined;

  constructor(private executionService: ExecutionsService) {}

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
        return;
      }
      this.performanceViewSettings = {
        startTime: startTime,
        endTime: endTime,
        contextualFilters: { eId: this.executionId },
      };
    });
  }
}
getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
