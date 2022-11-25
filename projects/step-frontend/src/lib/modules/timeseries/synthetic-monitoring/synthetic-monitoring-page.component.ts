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
import { forkJoin, Observable, of, Subject, Subscription, timer } from 'rxjs';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { TimeSeriesContext } from '../time-series-context';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';

@Component({
  selector: 'step-synthetic-monitoring',
  templateUrl: './synthetic-monitoring-page.component.html',
  styleUrls: ['./synthetic-monitoring-page.component.scss'],
})
export class SyntheticMonitoringPageComponent implements OnInit {
  readonly ONE_HOUR_MS = 3600 * 1000;

  @ViewChild(TimeRangePicker) rangePicker!: TimeRangePicker;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;
  @Input() taskId: string = window.location.href.split('?')[0].substring(window.location.href.lastIndexOf('/') + 1);

  context!: TimeSeriesContext;

  refreshEnabled = true;

  performanceViewSettings!: PerformanceViewSettings;
  readonly dashboardInitComplete$ = new Subject<void>();

  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 15 Minutes', timeInMs: this.ONE_HOUR_MS / 4 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
    { label: 'Last Day', timeInMs: this.ONE_HOUR_MS * 24 },
    { label: 'Last Week', timeInMs: this.ONE_HOUR_MS * 24 * 7 },
    { label: 'Last Month', timeInMs: this.ONE_HOUR_MS * 24 * 31 },
  ];

  // this is just for running executions
  refreshIntervals = [
    { label: '5 Sec', value: 5000 },
    { label: '30 Sec', value: 30 * 1000 },
    { label: '1 Min', value: 60 * 1000 },
    { label: '5 Min', value: 5 * 60 * 1000 },
    { label: '30 Min', value: 30 * 60 * 1000 },
    { label: 'Off', value: 0 },
  ];
  selectedRefreshInterval = this.refreshIntervals[0];

  refreshSubscription: Subscription | undefined;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private contextFactory: TimeSeriesContextsFactory
  ) {}

  ngOnInit(): void {
    if (!this.taskId) {
      throw new Error('ExecutionId parameter is not present');
    }
    let range = this.calculateRange(this.timeRangeOptions[0]);
    this.context = this.contextFactory.createContext(this.taskId, range);
    this.performanceViewSettings = this.createViewSettings(range);
    if (this.refreshEnabled) {
      this.triggerNextUpdate(this.selectedRefreshInterval.value, this.dashboardInitComplete$);
    }
  }

  onDashboardInit() {
    this.dashboardInitComplete$.next();
    this.dashboardInitComplete$.complete();
  }

  changeRefreshInterval(newInterval: { label: string; value: number }) {
    const oldInterval = this.selectedRefreshInterval;
    this.selectedRefreshInterval = newInterval;
    if (oldInterval.value === newInterval.value) {
      return;
    }
    this.refreshSubscription?.unsubscribe();
    if (newInterval.value) {
      this.refreshEnabled = true;
      this.triggerNextUpdate(newInterval.value, of(undefined));
    } else {
      this.refreshEnabled = false;
    }
  }

  calculateRange(selection: RelativeTimeSelection): TSTimeRange {
    let now = new Date().getTime();
    let start = now - selection.timeInMs;
    return { from: start, to: now };
  }

  createViewSettings(timeRange: TSTimeRange): PerformanceViewSettings {
    return {
      contextId: this.taskId,
      contextualFilters: { taskId: this.taskId },
      timeRange: timeRange,
    };
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.refreshSubscription?.unsubscribe();
    let newInterval;
    switch (selection.type) {
      case RangeSelectionType.FULL:
        throw new Error('Full range not available');
      case RangeSelectionType.ABSOLUTE:
        newInterval = selection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        const now = new Date().getTime();
        newInterval = { from: now - selection.relativeSelection!.timeInMs, to: now };
    }
    this.context.updateFullRange(newInterval);
    let update$ = this.performanceView.updateFullRange(newInterval);
    if (this.refreshEnabled) {
      this.triggerNextUpdate(this.selectedRefreshInterval.value, update$);
    } else {
      update$.subscribe();
    }
  }

  triggerNextUpdate(delay: number, observableToWaitFor: Observable<unknown>): void {
    this.refreshSubscription = forkJoin([timer(delay), observableToWaitFor]).subscribe(() => {
      const activeSelection = this.rangePicker.getActiveSelection();
      let now = new Date().getTime();
      let newInterval = { from: now - activeSelection.relativeSelection!.timeInMs, to: now };
      this.performanceViewSettings.timeRange = newInterval;
      let refresh$ = this.performanceView.updateFullRange(newInterval);
      // let refresh$ = this.performanceView.refreshAllCharts(true, false);
      this.triggerNextUpdate(this.selectedRefreshInterval.value, refresh$);
    });
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmDashboardLink(this.taskId));
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSyntheticMonitoring', downgradeComponent({ component: SyntheticMonitoringPageComponent }));
