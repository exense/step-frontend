import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, DashboardService } from '@exense/step-core';
import { TimeSeriesConfig } from '../../time-series.config';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';
import { TimeSeriesDashboardComponent } from '../../dashboard/time-series-dashboard.component';
import { RangeSelectionType } from '../../time-selection/model/range-selection-type';
import { TSTimeRange } from '../../chart/model/ts-time-range';
import { TimeSeriesDashboardSettings } from '../../dashboard/model/ts-dashboard-settings';
import { TsUtils } from '../../util/ts-utils';
import { FilterBarItemType } from '../../performance-view/filter-bar/model/ts-filter-item';
import { range, Subject, takeUntil, timer } from 'rxjs';
import { TimeSeriesUtils } from '../../time-series-utils';

@Component({
  selector: 'step-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export class AnalyticsPageComponent implements OnInit, OnDestroy {
  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  terminator$ = new Subject<void>();
  refreshEnabled = false;

  timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  timeRangeSelection!: TimeRangePickerSelection;

  // this is just for running executions
  refreshIntervals = TimeSeriesConfig.AUTO_REFRESH_INTERVALS;
  selectedRefreshInterval = this.refreshIntervals[this.refreshIntervals.length - 1];

  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;
  selectedGrouping = this.groupingOptions[0];

  stopInterval$ = new Subject();

  contextualParams: any = {};

  compareModeEnabled = false;
  executionHasToBeBuilt = false;
  migrationInProgress = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    let now = new Date().getTime();
    let start;
    let end;
    let urlParams = TsUtils.getURLParams(window.location.href);
    if (urlParams.refresh === '1') {
      this.refreshEnabled = true;
      this.selectedRefreshInterval = this.refreshIntervals[0];
    }
    // if start is present, an absolute selection will be set. otherwise we check for relativeRange in url
    if (urlParams.start) {
      start = parseInt(urlParams.start);
      end = parseInt(urlParams.end) ? parseInt(urlParams.end) : now;
      this.timeRangeSelection = { type: RangeSelectionType.ABSOLUTE, absoluteSelection: { from: start, to: end } };
    } else {
      if (urlParams.relativeRange && !isNaN(urlParams.relativeRange)) {
        const range = Number(urlParams.relativeRange);
        this.timeRangeSelection = this.getClosestRangeOption(range);
      } else {
        this.timeRangeSelection = this.timeRangeOptions[0];
      }
      start = now - this.timeRangeSelection.relativeSelection!.timeInMs;
      end = now;
    }

    delete urlParams.refresh; // in case it exists
    delete urlParams.relativeRange; // in case it exists
    delete urlParams.start;
    delete urlParams.end;

    this.dashboardSettings = {
      contextId: new Date().getTime().toString(),
      includeThreadGroupChart: true,
      disableThreadGroupOnOqlMode: true,
      timeRange: { from: start, to: end },
      contextualFilters: urlParams,
      showContextualFilters: true,
      timeRangeOptions: TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS,
      activeTimeRange: this.timeRangeSelection, // TODO handle url param
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
    this.dashboard.refresh(TimeSeriesUtils.convertSelectionToTimeRange(this.timeRangeSelection));
  }

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.dashboard.updateFullRange(TimeSeriesUtils.convertSelectionToTimeRange(selection)); // instant call
  }

  /**
   * This method will return the first option that is smaller or equal to the specified range
   * @param rangeMs
   */
  getClosestRangeOption(rangeMs: number): TimeRangePickerSelection {
    let lastRelativeOption: TimeRangePickerSelection = this.timeRangeOptions[0];
    for (let i = 0; i < this.timeRangeOptions.length; i++) {
      const currentOption = this.timeRangeOptions[i];
      if (currentOption.type === RangeSelectionType.RELATIVE) {
        if (currentOption.relativeSelection!.timeInMs === rangeMs) {
          return currentOption;
        }
        if (currentOption.relativeSelection!.timeInMs > rangeMs) {
          return lastRelativeOption || currentOption;
        }
        lastRelativeOption = currentOption;
      }
    }
    return lastRelativeOption;
  }

  toggleCompareMode() {
    this.compareModeEnabled = !this.compareModeEnabled;
    if (this.compareModeEnabled) {
      this.dashboard.enableCompareMode();
    } else {
      this.dashboard.disableCompareMode();
    }
  }

  exportRawData() {
    this.dashboard.exportRawData();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepAnalyticsPage', downgradeComponent({ component: AnalyticsPageComponent }));
