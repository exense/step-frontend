import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AJS_MODULE, DashboardService } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeRangePicker } from '../time-selection/time-range-picker.component';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { forkJoin, Observable, Subject, Subscription, timer } from 'rxjs';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';

@Component({
  selector: 'step-synthetic-monitoring',
  templateUrl: './synthetic-monitoring-page.component.html',
  styleUrls: ['./synthetic-monitoring-page.component.scss'],
})
export class SyntheticMonitoringPageComponent implements OnInit {
  readonly ONE_HOUR_MS = 3600 * 1000;
  private REFRESH_TIME_MS = 5000;

  @ViewChild(TimeRangePicker) rangePicker!: TimeRangePicker;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;
  @Input() taskId: string = window.location.href.split('?')[0].substring(window.location.href.lastIndexOf('/') + 1);

  performanceViewSettings: PerformanceViewSettings | undefined;
  readonly dashboardInitComplete$ = new Subject<void>();

  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 15 Minutes', timeInMs: this.ONE_HOUR_MS / 4 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
    { label: 'Last Day', timeInMs: this.ONE_HOUR_MS * 24 },
    { label: 'Last Week', timeInMs: this.ONE_HOUR_MS * 24 * 7 },
    { label: 'Last Month', timeInMs: this.ONE_HOUR_MS * 24 * 31 },
  ];

  refreshSubscription: Subscription | undefined;

  constructor(private changeDetector: ChangeDetectorRef, private dashboardService: DashboardService) {}

  onDashboardInit() {
    this.dashboardInitComplete$.next();
    this.dashboardInitComplete$.complete();
  }

  calculateRange(selection: RelativeTimeSelection): TSTimeRange {
    let now = new Date().getTime();
    let start = now - selection.timeInMs;
    return { from: start, to: now };
  }

  ngOnInit(): void {
    if (!this.taskId) {
      throw new Error('ExecutionId parameter is not present');
    }
    let range = this.calculateRange(this.timeRangeOptions[2]);
    this.performanceViewSettings = this.createViewSettings(range);
    this.triggerNextUpdate(this.REFRESH_TIME_MS, this.dashboardInitComplete$);
  }

  createViewSettings(timeRange: TSTimeRange) {
    return {
      contextId: this.taskId,
      contextualFilters: { taskId: this.taskId },
      startTime: timeRange.from!,
      endTime: timeRange.to!,
    };
  }

  onZoomChange(selection: ExecutionTimeSelection) {
    if (selection.type === RangeSelectionType.FULL) {
      // synthetic monitoring does not support full type
      selection.type = RangeSelectionType.ABSOLUTE;
    }
    this.refreshSubscription?.unsubscribe();
    this.rangePicker.setSelection(selection);
    console.log(selection);
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    let newInterval;
    switch (selection.type) {
      case RangeSelectionType.FULL:
        throw new Error('Full range not available');
      case RangeSelectionType.ABSOLUTE:
        this.refreshSubscription?.unsubscribe();
        newInterval = selection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        const now = new Date().getTime();
        newInterval = { from: now - selection.relativeSelection!.timeInMs, to: now };
    }

    if (!newInterval.from) {
      // we can't do anything since we don't know the start of the view.
      return;
    }
    if (!newInterval.to) {
      // if it's not specified, just show everything until now
      newInterval.to = new Date().getTime();
    }
    this.performanceViewSettings = undefined;
    this.changeDetector.detectChanges();
    this.performanceViewSettings = this.createViewSettings(newInterval);
    this.changeDetector.detectChanges();
  }

  triggerNextUpdate(delay: number, observableToWaitFor: Observable<unknown>) {
    this.refreshSubscription = forkJoin([timer(delay), observableToWaitFor]).subscribe(() => {
      const activeSelection = this.rangePicker.getActiveSelection();
      let now = new Date().getTime();
      let newInterval = { from: now - activeSelection.relativeSelection!.timeInMs, to: now };
      this.performanceViewSettings!.startTime = newInterval.from;
      this.performanceViewSettings!.endTime = newInterval.to;
      let refresh$ = this.performanceView.refreshAllCharts(true, false);
      this.triggerNextUpdate(this.REFRESH_TIME_MS, refresh$);
    });
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmDashboardLink(this.taskId));
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSyntheticMonitoring', downgradeComponent({ component: SyntheticMonitoringPageComponent }));
