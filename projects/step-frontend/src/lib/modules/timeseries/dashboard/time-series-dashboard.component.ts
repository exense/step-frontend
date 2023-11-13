import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { filter, forkJoin, merge, Subject, Subscription, switchMap, takeUntil, tap, throttle } from 'rxjs';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { FilterBarComponent } from '../performance-view/filter-bar/filter-bar.component';
import { FilterBarItemType, TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { PerformanceViewSettings } from '../performance-view/model/performance-view-settings';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeSeriesContext } from '../time-series-context';
import { TimeSeriesContextParams } from '../time-series-context-params';
import { TimeSeriesContextsFactory } from '../time-series-contexts-factory.service';
import { TimeSeriesDashboardSettings } from './model/ts-dashboard-settings';
import { TimeSeriesUtils } from '../time-series-utils';
import { ChartsViewComponent } from '../performance-view/charts-view.component';
import { TimeSeriesConfig } from '../time-series.config';
import { TableApiWrapperService, TimeSeriesService } from '@exense/step-core';

@Component({
  selector: 'step-timeseries-dashboard',
  templateUrl: './time-series-dashboard.component.html',
  styleUrls: ['./time-series-dashboard.component.scss'],
})
export class TimeSeriesDashboardComponent implements OnInit, OnDestroy {
  readonly ONE_HOUR_MS = 3600 * 1000;

  @Output() onTimeRangeChange: EventEmitter<TSTimeRange> = new EventEmitter<TSTimeRange>();

  @Input() settings!: TimeSeriesDashboardSettings;
  @ViewChild(ChartsViewComponent) chartsView!: ChartsViewComponent;
  @ViewChild(FilterBarComponent) filterBar?: FilterBarComponent;
  @ViewChild('compareFilterBar') compareFilterBar?: FilterBarComponent;

  timeRangeSelection: TimeRangePickerSelection = { type: RangeSelectionType.FULL };
  context!: TimeSeriesContext;
  performanceViewSettings: PerformanceViewSettings | undefined;
  private updateBaseChartsSubscription = new Subscription();
  private compareChartsSubscription = new Subscription();
  private throttledRefreshTrigger$: Subject<any> = new Subject();
  private terminator$ = new Subject();
  private compareTerminator$ = new Subject();

  timeRangeOptions: RelativeTimeSelection[] = [
    { label: 'Last 1 Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 5 Minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    { label: 'Last 30 Minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
  ];

  filterItems: TsFilterItem[] = [];
  filterOptions: TsFilterItem[] = [];

  compareModeEnabled: boolean = false;
  compareModeContext: TimeSeriesContext | undefined;
  compareModeFilterOptions: TsFilterItem[] = [];
  compareModeFilterItems: TsFilterItem[] = [];
  compareModeTimeRangeOptions = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  compareModeActiveRangeOption: TimeRangePickerSelection = { type: RangeSelectionType.FULL };

  exportInProgress = false;

  private _contextsFactory = inject(TimeSeriesContextsFactory);
  private _timeSeriesService = inject(TimeSeriesService);
  private _tableApiService = inject(TableApiWrapperService);

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input must be set');
    }
    // combine contextual filters (from URL) with custom specified filters
    this.filterItems = this.mergeContextualParamsWithActiveFilters(
      this.settings.contextualFilters,
      this.settings.activeFilters || []
    );
    this.timeRangeSelection = this.settings.activeTimeRange;
    this.filterOptions = this.prepareFilterOptions(this.filterItems, this.settings);
    const contextParams: TimeSeriesContextParams = {
      id: this.settings.contextId,
      timeRange: this.settings.timeRange,
      filters: this.filterItems,
      grouping: ['name'],
    };
    this.context = this._contextsFactory.createContext(contextParams);

    this.performanceViewSettings = this.settings;
    this.subscribeForContextChange();
  }

  private mergeContextualParamsWithActiveFilters(
    contextualParams: Record<string, string>,
    activeFilters: TsFilterItem[]
  ) {
    const contextualFilters = Object.keys(contextualParams).map((key) => {
      const fieldType = this.getFilterFieldType(key);
      const isEntityFilter =
        fieldType === FilterBarItemType.PLAN ||
        fieldType === FilterBarItemType.TASK ||
        fieldType === FilterBarItemType.EXECUTION;
      const searchValue = contextualParams[key];
      return {
        isHidden: !this.settings.showContextualFilters,
        removable: true,
        label: this.getFilterFieldLabel(key),
        type: fieldType,
        attributeName: key,
        freeTextValues: fieldType === FilterBarItemType.FREE_TEXT ? [searchValue] : [],
        searchEntities: isEntityFilter ? [{ searchValue: searchValue }] : [],
        isLocked: false,
        exactMatch: true,
      } as TsFilterItem;
    });
    let notContextualFilters = activeFilters.filter((item) => !contextualParams[item.attributeName]);
    return [...contextualFilters, ...notContextualFilters];
  }

  /**
   * Attributes that are hidden (e.g executionId) should not appear in the add filters menu
   * @param settings
   * @private
   */
  private prepareFilterOptions(activeFilters: TsFilterItem[], settings: TimeSeriesDashboardSettings): TsFilterItem[] {
    const hiddenFilters = activeFilters.filter((f) => f.isHidden).map((f) => f.attributeName) || [];
    return settings.filterOptions.map((f) => {
      if (hiddenFilters.includes(f.attributeName)) {
        f.isHidden = true;
      }
      return f;
    });
  }

  private getFilterFieldLabel(attribute: string): string {
    switch (attribute) {
      case 'eId':
        return 'Execution';
      case 'taskId':
        return 'Task';
      case 'plan':
        return 'Plan';
      default:
        return attribute;
    }
  }

  private getFilterFieldType(attribute: string): FilterBarItemType {
    switch (attribute) {
      case 'eId':
        return FilterBarItemType.EXECUTION;
      case 'taskId':
        return FilterBarItemType.TASK;
      case 'planId':
        return FilterBarItemType.PLAN;
      default:
        return FilterBarItemType.FREE_TEXT;
    }
  }

  public setChartsResolution(ms: number): void {
    this.context.updateChartsResolution(ms);
  }

  private updateBaseCharts(showLoading = false) {
    this.updateBaseChartsSubscription?.unsubscribe();
    let updateCharts$ = this.chartsView.updateBaseCharts({
      updateRanger: true,
      updateCharts: true,
      showLoadingBar: showLoading,
    });
    let refreshRanger$ = this.filterBar?.timeSelection?.refreshRanger();
    this.updateBaseChartsSubscription = forkJoin([updateCharts$, refreshRanger$]).subscribe();
  }

  private updateCompareCharts(showLoading = false) {
    this.compareChartsSubscription?.unsubscribe();
    let updateCharts$ = this.chartsView.updateCompareCharts({
      updateRanger: true,
      updateCharts: true,
      showLoadingBar: showLoading,
    });
    let refreshRanger$ = this.compareFilterBar?.timeSelection?.refreshRanger();
    this.compareChartsSubscription = forkJoin([updateCharts$, refreshRanger$]).subscribe();
  }

  subscribeForContextChange(): void {
    merge(this.context.onFilteringChange(), this.context.onGroupingChange())
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        this.updateBaseCharts(true);
      });
    this.throttledRefreshTrigger$
      .pipe(
        throttle(() => this.context.inProgressChange().pipe(filter((inProgress) => !inProgress))),
        takeUntil(this.terminator$)
      )
      .subscribe(() => {
        // let's calculate the new time range
        let fullRange = this.calculateTimeRange(this.timeRangeSelection);
        this.setRanges(fullRange);
        this.updateBaseCharts();
      });
    this.context.onCompareModeChange().subscribe(({ enabled, context }) => {
      this.compareModeEnabled = enabled;
      this.compareModeContext = context;
    });
  }

  handleFiltersChange(filters: TsFilterItem[]): void {
    this.context.updateActiveFilters(filters);
  }

  handleTimeRangeChange(params: { selection: TimeRangePickerSelection; triggerRefresh: boolean }) {
    this.timeRangeSelection = params.selection;
    let newTimeRange: TSTimeRange = this.calculateTimeRange(params.selection);
    this.updateFullRange(newTimeRange, params.triggerRefresh);
  }

  private calculateTimeRange(selection: TimeRangePickerSelection): TSTimeRange {
    let newTimeRange: TSTimeRange;
    if (this.settings.execution) {
      // we have an execution
      newTimeRange = TimeSeriesUtils.convertExecutionAndSelectionToTimeRange(
        this.settings.execution!,
        this.timeRangeSelection
      );
    } else {
      newTimeRange = TimeSeriesUtils.convertSelectionToTimeRange(selection);
    }
    return newTimeRange;
  }

  handleCompareTimeRangeChange(params: { selection: TimeRangePickerSelection; triggerRefresh: boolean }) {
    this.compareModeActiveRangeOption = params.selection;
    this.updateCompareChartsFullRange(
      TimeSeriesUtils.convertSelectionToTimeRange(params.selection),
      params.triggerRefresh
    );
  }

  setRanges(fullRange: TSTimeRange, selection?: TSTimeRange) {
    const isFullRangeSelected = this.context.isFullRangeSelected();
    let newSelection = selection || this.context.getSelectedTimeRange();
    this.context.updateFullRange(fullRange, false);
    if (isFullRangeSelected && !selection) {
      newSelection = fullRange;
    } else {
      // we crop it
      const newFrom = Math.max(fullRange.from, newSelection.from);
      const newTo = Math.min(fullRange.to, newSelection.to);
      if (newTo - newFrom < 3) {
        newSelection = fullRange; // zoom reset when the interval is very small
      } else {
        newSelection = { from: newFrom, to: newTo };
      }
    }
    this.context.updateSelectedRange(newSelection, false);
  }

  refresh() {
    if (this.compareModeEnabled) {
      // don't do the update while in compare mode
      return;
    }
    this.throttledRefreshTrigger$.next(true);
  }

  /**
   * This method has to make sure that it doesn't overlap another running update.
   * Used for auto-refresh.
   * @param range
   *  @Deprecated - the range is calculated inside the refresh
   */
  refreshWithNewRange(range: TSTimeRange, selection?: TSTimeRange): void {
    this.setRanges(range, selection);
    if (this.compareModeEnabled) {
      // don't do the update while in compare mode
      return;
    }
    this.throttledRefreshTrigger$.next(true);
  }

  /**
   * This is a force refresh (instantly triggered).
   * The selection will be set to full selection.
   */
  updateFullRange(range: TSTimeRange, forceRefresh = true): void {
    this.onTimeRangeChange.emit(range);
    this.updateBaseChartsSubscription?.unsubscribe(); // end current execution
    this.context.updateFullRange(range, false);
    this.context.updateSelectedRange(range, false);
    if (forceRefresh) {
      const updateCharts$ = this.chartsView.updateBaseCharts({
        updateRanger: true,
        updateCharts: true,
        showLoadingBar: true,
      });
      let refreshRanger$ = this.filterBar?.timeSelection?.refreshRanger();
      this.updateBaseChartsSubscription = forkJoin([updateCharts$, refreshRanger$]).subscribe();
    }
  }

  updateCompareChartsFullRange(range: TSTimeRange, refreshCharts = true) {
    this.compareChartsSubscription?.unsubscribe(); // end current execution
    this.compareModeContext?.updateFullRange(range, false);
    this.compareModeContext?.updateSelectedRange(range, false);
    if (refreshCharts) {
      const updateCharts$ = this.chartsView.updateCompareCharts({
        updateRanger: true,
        updateCharts: true,
        showLoadingBar: true,
      });
      let refreshRanger$ = this.compareFilterBar?.timeSelection?.refreshRanger();
      this.compareChartsSubscription = forkJoin([updateCharts$, refreshRanger$]).subscribe();
    }
  }

  public disableCompareMode(): void {
    this.context.disableCompareMode();
    this.compareTerminator$.next(true);
  }

  public enableCompareMode(): void {
    this.compareModeFilterOptions = this.filterOptions.map((i) => ({ ...i, isHidden: false }));
    this.compareModeFilterItems = this.prepareFiltersForCompareMode();
    const timeRange = JSON.parse(JSON.stringify(this.context.getFullTimeRange()));
    const compareContext = this._contextsFactory.createContext({
      timeRange: timeRange,
      id: new Date().getTime().toString(),
      grouping: this.context.getGroupDimensions(),
      filters: this.compareModeFilterItems,
      keywordsContext: this.context.keywordsContext, // share the same keywords context and colors
    });
    this.compareModeActiveRangeOption = { type: RangeSelectionType.ABSOLUTE, absoluteSelection: timeRange };
    merge(compareContext.onFilteringChange(), compareContext.onGroupingChange())
      .pipe(takeUntil(this.compareTerminator$))
      .subscribe(() => {
        this.updateCompareCharts(true);
      });
    this.context.enableCompareMode(compareContext);
  }

  public exportRawData(): void {
    if (this.exportInProgress) {
      return;
    }
    const filtersOql = this.context.buildActiveOQL(true, true);
    this.exportInProgress = true;
    this._timeSeriesService
      .getMeasurementsAttributes(filtersOql)
      .pipe(
        switchMap((fields) =>
          this._tableApiService.exportAsCSV('measurements', fields, { filters: [{ oql: filtersOql }] })
        ),
        tap(() => (this.exportInProgress = false))
      )
      .subscribe();
  }

  private prepareFiltersForCompareMode(): TsFilterItem[] {
    return this.filterItems.map((i) => ({ ...JSON.parse(JSON.stringify(i)), isHidden: false })); // deep clone the objects
  }

  ngOnDestroy(): void {
    this.terminator$.next(true);
    this.compareTerminator$.next(true);
    this._contextsFactory.destroyContext(this.context.id);
    this.updateBaseChartsSubscription.unsubscribe();
  }
}
