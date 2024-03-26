import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TimeRange, TimeSeriesService } from '@exense/step-core';
import { Subject, takeUntil, timer } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  TimeRangePickerSelection,
  TimeSeriesUtils,
  TimeSeriesConfig,
  ChartUrlParamsService,
  FilterBarItemType,
  FilterBarItem,
  COMMON_IMPORTS,
  ResolutionPickerComponent,
  ChartUrlParams,
  TimeSeriesContext,
  FilterUtils,
} from '../../../_common';
import { TimeSeriesDashboardComponent } from '../time-series-dashboard/time-series-dashboard.component';
import { TimeSeriesDashboardSettings } from '../../types/ts-dashboard-settings';
import {
  DashboardUrlParams,
  DashboardUrlParamsService,
} from '../../../_common/injectables/dashboard-url-params.service';

@Component({
  selector: 'step-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
  providers: [DashboardUrlParamsService],
  standalone: true,
  imports: [COMMON_IMPORTS, ResolutionPickerComponent, TimeSeriesDashboardComponent],
})
export class AnalyticsPageComponent implements OnInit, OnDestroy {
  private _chartUrlParams = inject(DashboardUrlParamsService);

  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;

  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  terminator$ = new Subject<void>();
  refreshEnabled = false;

  timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  timeRangeSelection!: TimeRangePickerSelection;
  activeTimeRange: TimeRange = { from: 0, to: 0 };

  // this is just for running executions
  refreshIntervals = TimeSeriesConfig.AUTO_REFRESH_INTERVALS;
  selectedRefreshInterval = this.refreshIntervals[this.refreshIntervals.length - 1];

  stopInterval$ = new Subject();

  compareModeEnabled = false;
  context?: TimeSeriesContext;

  ngOnInit(): void {
    let now = new Date().getTime();
    let start: number;
    let end: number;
    let urlParams: DashboardUrlParams = this._chartUrlParams.collectUrlParams();
    if (urlParams.refreshInterval) {
      this.refreshEnabled = true;
      this.selectedRefreshInterval = this.refreshIntervals[0];
    }

    if (urlParams.timeRange?.type === 'ABSOLUTE') {
      start = urlParams.timeRange!.absoluteSelection!.from;
      end = urlParams.timeRange!.absoluteSelection!.to;
      this.timeRangeSelection = { type: 'ABSOLUTE', absoluteSelection: { from: start, to: end } };
    } else {
      if (urlParams.timeRange?.type === 'RELATIVE') {
        this.timeRangeSelection = this.getClosestRangeOption(urlParams.timeRange!.relativeSelection!.timeInMs);
      } else {
        this.timeRangeSelection = this.timeRangeOptions[0];
      }
      end = now;
      start = end - this.timeRangeSelection.relativeSelection!.timeInMs;
    }

    let timeRange = { from: start, to: end };
    this.activeTimeRange = timeRange;
    const urlFilters = FilterUtils.convertUrlKnownFilters(urlParams.filters, TimeSeriesConfig.KNOWN_ATTRIBUTES).filter(
      FilterUtils.filterItemIsValid,
    );
    const defaultFilters = this.getDefaultFilters();

    this.dashboardSettings = {
      contextId: new Date().getTime().toString(),
      includeThreadGroupChart: true,
      disableThreadGroupOnOqlMode: true,
      timeRange: timeRange,
      contextualFilters: {},
      showContextualFilters: true,
      grouping: urlParams.grouping,
      timeRangeOptions: TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS,
      activeTimeRange: this.timeRangeSelection, // TODO handle url param
      filterOptions: this.getDefaultFilters(),
      activeFilters: this.mergeDefaultFiltersWithUrlFilters(defaultFilters, urlFilters),
    };
    if (this.refreshEnabled) {
      this.startInterval(this.selectedRefreshInterval.value);
    }
  }

  private mergeDefaultFiltersWithUrlFilters(defaultFilters: FilterBarItem[], urlFilters: FilterBarItem[]) {
    defaultFilters.forEach((item, i) => {
      let foundIndex = urlFilters.findIndex((el) => el.attributeName === item.attributeName);
      if (foundIndex > -1) {
        defaultFilters[i] = urlFilters[foundIndex]; // let's replace the default filter item
        urlFilters.splice(foundIndex, 1);
      }
    });
    return [...defaultFilters, ...urlFilters];
  }

  dashboardContextInitialized(context: TimeSeriesContext) {
    this.context = context;
    this._chartUrlParams.updateUrlParams(context, this.timeRangeSelection, this.selectedRefreshInterval.value);
    context.stateChange$.subscribe(() => {
      this._chartUrlParams.updateUrlParams(context, this.timeRangeSelection, this.selectedRefreshInterval.value);
    });
  }

  handleDashboardTimeRangeChange(range: TimeRange) {
    this.activeTimeRange = range;
  }

  private getDefaultFilters(): FilterBarItem[] {
    return [
      {
        label: 'Status',
        attributeName: 'rnStatus',
        type: FilterBarItemType.OPTIONS,
        textValues: [{ value: 'PASSED' }, { value: 'FAILED' }, { value: 'TECHNICAL_ERROR' }, { value: 'INTERRUPTED' }],
        isLocked: true,
        searchEntities: [],
      },
      {
        label: 'Type',
        attributeName: 'type',
        type: FilterBarItemType.OPTIONS,
        textValues: [{ value: 'keyword' }, { value: 'custom' }],
        isLocked: true,
        searchEntities: [],
      },
      {
        label: 'Name',
        attributeName: 'name',
        type: FilterBarItemType.FREE_TEXT,
        isLocked: true,
        searchEntities: [],
      },
      {
        label: 'Execution',
        attributeName: 'eId',
        type: FilterBarItemType.EXECUTION,
        isLocked: true,
        searchEntities: [],
        exactMatch: true,
      },
      {
        label: 'Origin',
        attributeName: 'origin',
        type: FilterBarItemType.FREE_TEXT,
        isLocked: true,
        searchEntities: [],
      },
      {
        label: 'Task',
        attributeName: 'taskId',
        type: FilterBarItemType.TASK,
        isLocked: true,
        searchEntities: [],
        exactMatch: true,
      },
      {
        label: 'Plan',
        attributeName: 'planId',
        type: FilterBarItemType.PLAN,
        isLocked: true,
        searchEntities: [],
        exactMatch: true,
      },
    ];
  }

  handleResolutionChange(resolution: number) {
    this.menuTrigger.closeMenu();
    this.dashboard.setChartsResolution(resolution);
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
    this.dashboard.refresh();
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
      if (currentOption.type === 'RELATIVE') {
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
