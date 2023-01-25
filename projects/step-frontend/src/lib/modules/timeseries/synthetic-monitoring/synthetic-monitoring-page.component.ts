import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AJS_MODULE, DashboardService } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeRangePicker } from '../time-selection/time-range-picker.component';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { Subject, Subscription, takeUntil, tap, timer } from 'rxjs';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeSeriesDashboardSettings } from '../dashboard/model/ts-dashboard-settings';
import { TimeSeriesDashboardComponent } from '../dashboard/time-series-dashboard.component';
import { FilterBarItemType } from '../performance-view/filter-bar/model/ts-filter-item';
import { TsUtils } from '../util/ts-utils';

@Component({
  selector: 'step-synthetic-monitoring',
  templateUrl: './synthetic-monitoring-page.component.html',
  styleUrls: ['./synthetic-monitoring-page.component.scss'],
})
export class SyntheticMonitoringPageComponent implements OnInit, OnDestroy {
  terminator$ = new Subject<void>();

  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  @ViewChild(TimeRangePicker) rangePicker!: TimeRangePicker;
  @Input() taskId: string = window.location.href.split('?')[0].substring(window.location.href.lastIndexOf('/') + 1);

  refreshEnabled = true;

  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  timeRangeOptions: RelativeTimeSelection[] = TimeSeriesConfig.SYNTHETIC_MONITORING_TIME_OPTIONS;
  timeRangeSelection: TimeRangePickerSelection = {
    type: RangeSelectionType.RELATIVE,
    relativeSelection: this.timeRangeOptions[0],
  };

  // this is just for running executions
  refreshIntervals = TimeSeriesConfig.AUTO_REFRESH_INTERVALS;
  selectedRefreshInterval = this.refreshIntervals[0];

  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;
  selectedGrouping = this.groupingOptions[0];

  stopInterval$ = new Subject();

  constructor(private changeDetector: ChangeDetectorRef, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    if (!this.taskId) {
      throw new Error('ExecutionId parameter is not present');
    }
    let selectedTimeRange = this.timeRangeOptions[0];
    let now = new Date().getTime();
    let start = now - selectedTimeRange.timeInMs;
    let range = { from: start, to: now };
    let urlParams = TsUtils.getURLParams(window.location.href);
    this.dashboardSettings = {
      contextId: this.taskId,
      includeThreadGroupChart: true,
      timeRange: range,
      contextualFilters: { ...urlParams, taskId: this.taskId },
      filterOptions: [
        {
          label: 'Status',
          attributeName: 'rnStatus',
          type: FilterBarItemType.OPTIONS,
          textValues: [
            { value: 'PASSED' },
            { value: 'FAILED' },
            { value: 'TECHNICAL_ERROR' },
            { value: 'INTERRUPTED' },
          ],
          isLocked: true,
        },
        {
          label: 'Type',
          attributeName: 'type',
          type: FilterBarItemType.OPTIONS,
          textValues: [{ value: 'keyword' }, { value: 'custom' }],
          isLocked: true,
        },
        {
          label: 'Name',
          attributeName: 'name',
          type: FilterBarItemType.FREE_TEXT,
          isLocked: true,
        },
        {
          label: 'Execution Id',
          attributeName: 'eId',
          type: FilterBarItemType.FREE_TEXT,
          isLocked: true,
        },
        {
          label: 'Origin',
          attributeName: 'origin',
          type: FilterBarItemType.FREE_TEXT,
          isLocked: true,
        },
        {
          label: 'Plan Id',
          attributeName: 'planId',
          type: FilterBarItemType.FREE_TEXT,
          isLocked: true,
        },
      ],
    };
    if (this.refreshEnabled) {
      this.startInterval(this.selectedRefreshInterval.value);
    }
  }

  startInterval(delay = 0) {
    this.stopInterval$.next(null); // make sure to stop it if it's still running
    timer(delay, this.selectedRefreshInterval.value)
      .pipe(takeUntil(this.stopInterval$), takeUntil(this.terminator$))
      .subscribe(() => this.triggerRefresh());
  }

  triggerRefresh() {
    this.dashboard.refresh(this.calculateRange());
  }

  changeRefreshInterval(newInterval: { label: string; value: number }) {
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

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.dashboard.updateRange(this.calculateRange()); // instant call
    if (this.selectedRefreshInterval.value) {
      // maybe it is stopped
      this.startInterval(this.selectedRefreshInterval.value);
    }
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmDashboardLink(this.taskId));
  }

  calculateRange(): TSTimeRange {
    let now = new Date().getTime();
    let newFullRange: TSTimeRange;
    switch (this.timeRangeSelection.type) {
      case RangeSelectionType.FULL:
        throw new Error('Full range selection is not supported');
      case RangeSelectionType.ABSOLUTE:
        newFullRange = this.timeRangeSelection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        let end = now;
        newFullRange = { from: end - this.timeRangeSelection.relativeSelection!.timeInMs!, to: end };
        break;
    }
    return newFullRange;
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSyntheticMonitoring', downgradeComponent({ component: SyntheticMonitoringPageComponent }));
