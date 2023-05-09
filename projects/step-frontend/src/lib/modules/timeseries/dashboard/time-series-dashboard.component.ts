import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { filter, merge, Subject, Subscription, takeUntil, throttle } from 'rxjs';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { FilterBarComponent } from '../performance-view/filter-bar/filter-bar.component';
import { FilterBarItemType, TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { PerformanceViewComponent } from '../performance-view/performance-view.component';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeSeriesContext } from '../time-series-context';
import { TimeSeriesContextParams } from '../time-series-context-params';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { TimeSeriesDashboardSettings } from './model/ts-dashboard-settings';
import { TsFilteringSettings } from '../model/ts-filtering-settings';

@Component({
  selector: 'step-timeseries-dashboard',
  templateUrl: './time-series-dashboard.component.html',
  styleUrls: ['./time-series-dashboard.component.scss'],
})
export class TimeSeriesDashboardComponent implements OnInit, OnDestroy {
  readonly ONE_HOUR_MS = 3600 * 1000;

  @Input() settings!: TimeSeriesDashboardSettings;
  @ViewChild(PerformanceViewComponent) performanceView!: PerformanceViewComponent;
  @ViewChild(FilterBarComponent) filterBar?: FilterBarComponent;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };
  context!: TimeSeriesContext;
  performanceViewSettings: PerformanceViewSettings | undefined;
  private updateSubscription = new Subscription();
  private throttledRefreshTrigger$: Subject<any> = new Subject();
  private terminator$ = new Subject();

  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 5 Minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    { label: 'Last 30 Minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
  ];

  contextualFilterItems: TsFilterItem[] = [];

  constructor(private contextsFactory: TimeSeriesContextsFactory) {}

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input must be set');
    }
    this.contextualFilterItems = Object.keys(this.settings.contextualFilters).map((key) => {
      return {
        isHidden: !this.settings.showContextualFilters,
        removable: true,
        label: key,
        type: FilterBarItemType.FREE_TEXT,
        attributeName: key,
        freeTextValues: [this.settings.contextualFilters[key]],
        isLocked: false,
        exactMatch: true,
      };
    });
    const contextParams: TimeSeriesContextParams = {
      id: this.settings.contextId,
      timeRange: this.settings.timeRange,
      dynamicFilters: this.contextualFilterItems,
      grouping: ['name'],
    };
    this.context = this.contextsFactory.createContext(contextParams);
    this.performanceViewSettings = this.settings;
    this.subscribeForContextChange();
    this.throttledRefreshTrigger$
      .pipe(
        throttle(() => this.context.inProgressChange().pipe(filter((inProgress) => !inProgress))),
        takeUntil(this.terminator$)
      )
      .subscribe(() => {
        this.updateDashboard();
      });
  }

  private updateDashboard(showLoading = false) {
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = this.performanceView
      .updateDashboard({
        updateRanger: true,
        updateCharts: true,
        showLoadingBar: showLoading,
      })
      .subscribe();
  }

  subscribeForContextChange(): void {
    merge(this.context.onFilteringChange(), this.context.onGroupingChange())
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        this.updateDashboard(true);
      });
  }

  handleFiltersChange(filters: TsFilterItem[]): void {
    this.context.updateActiveFilters(filters);
  }

  handleFilteringChange(settings: TsFilteringSettings): void {
    this.context.setFilteringSettings(settings);
  }

  handleGroupingChange(dimensions: string[]) {
    this.context.updateGrouping(dimensions);
  }

  setRanges(fullRange: TSTimeRange, selection?: TSTimeRange) {
    let isFullRangeSelected = this.context.isFullRangeSelected();
    let newSelection = selection || this.context.getSelectedTimeRange();
    this.context.updateFullRange(fullRange, false);
    if (isFullRangeSelected && !selection) {
      newSelection = fullRange;
    } else {
      // we crop it
      let newFrom = Math.max(fullRange.from, newSelection.from);
      let newTo = Math.min(fullRange.to, newSelection.to);
      if (newTo - newFrom < 3) {
        newSelection = fullRange; // zoom reset when the interval is very small
      } else {
        newSelection = { from: newFrom, to: newTo };
      }
    }
    this.context.updateSelectedRange(newSelection, false);
  }

  /**
   * This method has to make sure that it doesn't overlap another running update.
   * Used for auto-refresh.
   * @param range
   */
  refresh(range: TSTimeRange, selection?: TSTimeRange): void {
    this.setRanges(range, selection);
    this.throttledRefreshTrigger$.next(true);
  }

  /**
   * This is a force refresh (instantly triggered).
   * The selection will be set to full selection.
   */
  updateRange(range: TSTimeRange) {
    this.updateSubscription?.unsubscribe(); // end current execution
    this.context.updateFullRange(range, false);
    this.context.updateSelectedRange(range, false);
    this.updateSubscription = this.performanceView
      .updateDashboard({
        updateRanger: true,
        updateCharts: true,
        showLoadingBar: true,
      })
      .subscribe();
  }

  ngOnDestroy(): void {
    this.terminator$.next(true);
    this.contextsFactory.destroyContext(this.context.id);
    this.updateSubscription.unsubscribe();
  }
}
