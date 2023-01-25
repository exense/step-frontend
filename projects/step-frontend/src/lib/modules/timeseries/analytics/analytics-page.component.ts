import { AfterViewInit, Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeSeriesDashboardComponent } from '../dashboard/time-series-dashboard.component';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesDashboardSettings } from '../dashboard/model/ts-dashboard-settings';
import { TsUtils } from '../util/ts-utils';
import { FilterBarItemType } from '../performance-view/filter-bar/model/ts-filter-item';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'step-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export class AnalyticsPageComponent implements OnInit {
  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  terminator$ = new Subject<void>();
  refreshEnabled = false;

  timeRangeOptions: RelativeTimeSelection[] = TimeSeriesConfig.SYNTHETIC_MONITORING_TIME_OPTIONS;
  timeRangeSelection: TimeRangePickerSelection = {
    type: RangeSelectionType.RELATIVE,
    relativeSelection: this.timeRangeOptions[0],
  };

  // this is just for running executions
  refreshIntervals = TimeSeriesConfig.AUTO_REFRESH_INTERVALS;
  selectedRefreshInterval = this.refreshIntervals[this.refreshIntervals.length - 1];

  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;
  selectedGrouping = this.groupingOptions[0];

  stopInterval$ = new Subject();

  ngOnInit(): void {
    let selectedTimeRange = this.timeRangeOptions[0];
    let now = new Date().getTime();
    let start = now - selectedTimeRange.timeInMs;
    let range = { from: start, to: now };
    let urlParams = TsUtils.getURLParams(window.location.href);
    this.dashboardSettings = {
      contextId: new Date().getTime().toString(),
      includeThreadGroupChart: true,
      timeRange: range,
      contextualFilters: urlParams,
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

  startInterval(delay = 0) {
    this.stopInterval$.next(null); // make sure to stop it if it's still running
    timer(delay, this.selectedRefreshInterval.value)
      .pipe(takeUntil(this.stopInterval$), takeUntil(this.terminator$))
      .subscribe(() => this.triggerRefresh());
  }

  triggerRefresh() {
    this.dashboard.refresh(this.calculateRange());
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.dashboard.updateRange(this.calculateRange()); // instant call
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
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepAnalyticsPage', downgradeComponent({ component: AnalyticsPageComponent }));
