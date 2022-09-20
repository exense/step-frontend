import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AJS_MODULE, DashboardService } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/performance-view-settings';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeRangePicker } from '../time-selection/time-range-picker.component';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';

@Component({
  selector: 'step-synthetic-monitoring',
  templateUrl: './synthetic-monitoring-page.component.html',
  styleUrls: ['./synthetic-monitoring-page.component.scss'],
})
export class SyntheticMonitoringPageComponent implements OnInit {
  readonly ONE_HOUR_MS = 3600 * 1000;

  @ViewChild(TimeRangePicker) rangePicker!: TimeRangePicker;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;
  @Input() taskId: string = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

  performanceViewSettings: PerformanceViewSettings | undefined;

  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
    { label: 'Last Day', timeInMs: this.ONE_HOUR_MS * 24 },
    { label: 'Last Week', timeInMs: this.ONE_HOUR_MS * 24 * 7 },
    { label: 'Last Month', timeInMs: this.ONE_HOUR_MS * 24 * 31 },
  ];

  constructor(private changeDetector: ChangeDetectorRef, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    if (!this.taskId) {
      throw new Error('ExecutionId parameter is not present');
    }
    let timeRange = this.calculateRangeInterval({
      type: RangeSelectionType.RELATIVE,
      relativeSelection: this.timeRangeOptions[0],
    });
    this.performanceViewSettings = this.getViewSettings(timeRange);
  }

  getViewSettings(timeRange: TSTimeRange) {
    return {
      contextId: this.taskId,
      contextualFilters: { taskId: this.taskId },
      startTime: timeRange.from!,
      endTime: timeRange.to!,
    };
  }

  calculateRangeInterval(pickerSelection: TimeRangePickerSelection): TSTimeRange {
    const now = new Date().getTime();
    switch (pickerSelection.type) {
      case RangeSelectionType.FULL:
        throw new Error('Full range not available');
      case RangeSelectionType.ABSOLUTE:
        return pickerSelection.absoluteSelection!;
      case RangeSelectionType.RELATIVE:
        return { from: now - pickerSelection.relativeSelection!.timeInMs, to: now };
    }
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    let newInterval = this.calculateRangeInterval(selection);
    this.performanceViewSettings = undefined;
    this.changeDetector.detectChanges();
    this.performanceViewSettings = this.getViewSettings(newInterval);
    this.changeDetector.detectChanges();
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmDashboardLink(this.taskId));
  }
}
getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSyntheticMonitoring', downgradeComponent({ component: SyntheticMonitoringPageComponent }));
