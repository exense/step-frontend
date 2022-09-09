import { Component, Input, OnInit } from '@angular/core';
import { AJS_MODULE } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../execution-page/performance-view-settings';

@Component({
  selector: 'step-synthetic-monitoring',
  templateUrl: './synthetic-monitoring-page.component.html',
  styleUrls: ['./synthetic-monitoring-page.component.scss'],
})
export class SyntheticMonitoringPageComponent implements OnInit {
  @Input() taskId: string = '631b474d1be382468920a391';

  performanceViewSettings: PerformanceViewSettings | undefined;

  constructor() {}

  ngOnInit(): void {
    if (!this.taskId) {
      throw new Error('ExecutionId parameter is not present');
    }
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    this.performanceViewSettings = {
      contextualFilters: { taskId: this.taskId },
      startTime: yesterday.getTime(),
      endTime: now.getTime(),
    };
  }
}
getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSyntheticMonitoring', downgradeComponent({ component: SyntheticMonitoringPageComponent }));
