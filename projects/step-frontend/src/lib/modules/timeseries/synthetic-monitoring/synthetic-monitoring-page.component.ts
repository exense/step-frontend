import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AJS_MODULE, DashboardService } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeRangePicker } from '../time-selection/time-range-picker.component';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { forkJoin, Observable, of, Subject, Subscription, takeUntil, tap, timer } from 'rxjs';
import { TimeSeriesContext } from '../time-series-context';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeSeriesUtils } from '../time-series-utils';

@Component({
  selector: 'step-synthetic-monitoring',
  templateUrl: './synthetic-monitoring-page.component.html',
  styleUrls: ['./synthetic-monitoring-page.component.scss'],
})
export class SyntheticMonitoringPageComponent implements OnInit, OnDestroy {
  readonly ONE_HOUR_MS = 3600 * 1000;

  terminator$ = new Subject<void>();

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
  timeRangeSelection: TimeRangePickerSelection = {
    type: RangeSelectionType.RELATIVE,
    relativeSelection: this.timeRangeOptions[0],
  };

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

  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;
  selectedGrouping = this.groupingOptions[0];

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
    this.subscribeForFiltersChange();
    if (this.refreshEnabled) {
      this.triggerNextUpdate(this.selectedRefreshInterval.value, this.dashboardInitComplete$);
    }
  }

  subscribeForFiltersChange(): void {
    this.context
      .onActiveFilterChange()
      .pipe(takeUntil(this.terminator$))
      .subscribe((filters) => {
        this.refreshSubscription?.unsubscribe();
        console.log('FILTER CHANGE');
        this.triggerNextUpdate(0, of(null), true, true); // refresh immediately
      });
  }

  handleFiltersChange(filters: TsFilterItem[]): void {
    console.log('received filter');
    this.context.updateActiveFilters(filters);
  }

  emitGroupDimensions(): void {
    this.context.updateGrouping(this.selectedGrouping.attributes);
  }

  onDashboardInit() {
    this.dashboardInitComplete$.next();
    this.dashboardInitComplete$.complete();
  }

  changeRefreshInterval(newInterval: { label: string; value: number }) {
    if (newInterval.value === this.selectedRefreshInterval.value) {
      return;
    }
    this.refreshSubscription?.unsubscribe();
    this.selectedRefreshInterval = newInterval;
    if (newInterval.value) {
      this.refreshEnabled = true;
      this.triggerNextUpdate(newInterval.value, of(null));
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
    this.timeRangeSelection = selection;
    this.refreshSubscription?.unsubscribe();
    this.triggerNextUpdate(0, of(null), true, true, true);
  }

  triggerNextUpdate(
    delay: number,
    observableToWaitFor: Observable<unknown>,
    forceUpdate = false,
    showLoadingBar = false,
    resetSelection = false
  ): void {
    this.refreshSubscription = forkJoin([timer(delay), observableToWaitFor])
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        let now = new Date().getTime();
        let isFullRangeSelected = this.context.isFullRangeSelected();
        let oldSelection = this.context.getSelectedTimeRange();
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
        // when the selection is 0, it will switch to full selection automatically
        let newSelection =
          isFullRangeSelected || resetSelection
            ? newFullRange
            : TimeSeriesUtils.cropInterval(newFullRange, oldSelection) || newFullRange;

        let updateDashboard$ = this.performanceView.updateDashboard({
          updateRanger: true,
          updateCharts: forceUpdate || JSON.stringify(newSelection) !== JSON.stringify(oldSelection),
          fullTimeRange: newFullRange,
          selection: newSelection,
          showLoadingBar: showLoadingBar,
        });
        // the execution is not done yet
        if (this.selectedRefreshInterval.value) {
          // refresh is on
          this.triggerNextUpdate(this.selectedRefreshInterval.value, updateDashboard$); // recursive call
        } else {
          updateDashboard$.subscribe();
        }
      });
  }

  navigateToRtmDashboard() {
    window.open(this.dashboardService.getRtmDashboardLink(this.taskId));
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSyntheticMonitoring', downgradeComponent({ component: SyntheticMonitoringPageComponent }));
