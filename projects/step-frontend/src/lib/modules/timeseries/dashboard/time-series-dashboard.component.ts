import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

  contextualFilterItems: TsFilterItem[] = [];

  compareModeEnabled: boolean = false;
  compareModeContext: TimeSeriesContext | undefined;
  compareModeTimeRangeOptions = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  compareModeActiveRangeOption: TimeRangePickerSelection = { type: RangeSelectionType.FULL };

  exportInProgress = false;

  constructor(
    private contextsFactory: TimeSeriesContextsFactory,
    private _timeSeriesService: TimeSeriesService,
    private _tableApiService: TableApiWrapperService
  ) {}

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
      filters: this.contextualFilterItems,
      grouping: ['name'],
    };
    this.context = this.contextsFactory.createContext(contextParams);

    this.performanceViewSettings = this.settings;
    this.subscribeForContextChange();
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

  handleTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    //TODO optional execution
    let newTimeRange: TSTimeRange;
    if (this.settings.execution) {
      newTimeRange = TimeSeriesUtils.convertExecutionAndSelectionToTimeRange(
        this.settings.execution!,
        this.timeRangeSelection
      );
    } else {
      newTimeRange = TimeSeriesUtils.convertSelectionToTimeRange(selection);
    }
    this.updateFullRange(newTimeRange);
  }

  handleCompareTimeRangeChange(selection: TimeRangePickerSelection) {
    this.compareModeActiveRangeOption = selection;
    this.updateCompareChartsFullRange(TimeSeriesUtils.convertSelectionToTimeRange(selection));
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

  /**
   * This method has to make sure that it doesn't overlap another running update.
   * Used for auto-refresh.
   * @param range
   */
  refresh(range: TSTimeRange, selection?: TSTimeRange): void {
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
  updateFullRange(range: TSTimeRange): void {
    this.updateBaseChartsSubscription?.unsubscribe(); // end current execution
    this.context.updateFullRange(range, false);
    this.context.updateSelectedRange(range, false);
    console.log('range update');
    const updateCharts$ = this.chartsView.updateBaseCharts({
      updateRanger: true,
      updateCharts: true,
      showLoadingBar: true,
    });
    let refreshRanger$ = this.filterBar?.timeSelection?.refreshRanger();
    this.updateBaseChartsSubscription = forkJoin([updateCharts$, refreshRanger$]).subscribe();
  }

  updateCompareChartsFullRange(range: TSTimeRange) {
    this.compareChartsSubscription?.unsubscribe(); // end current execution
    this.compareModeContext?.updateFullRange(range, false);
    this.compareModeContext?.updateSelectedRange(range, false);
    const updateCharts$ = this.chartsView.updateCompareCharts({
      updateRanger: true,
      updateCharts: true,
      showLoadingBar: true,
    });
    let refreshRanger$ = this.compareFilterBar?.timeSelection?.refreshRanger();
    this.compareChartsSubscription = forkJoin([updateCharts$, refreshRanger$]).subscribe();
  }

  public disableCompareMode(): void {
    this.context.disableCompareMode();
    this.compareTerminator$.next(true);
  }

  public enableCompareMode(): void {
    const filters = this.prepareFiltersForCompareMode();
    const timeRange = JSON.parse(JSON.stringify(this.context.getFullTimeRange()));
    const compareContext = this.contextsFactory.createContext({
      timeRange: timeRange,
      id: new Date().getTime().toString(),
      grouping: ['name'], // the grouping component don't currently support a custom default value other than 'name'
      filters: filters,
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

  public exportRawData() {
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
    return Object.keys(this.settings.contextualFilters).map((key) => {
      const label = key === 'eId' ? 'Execution Id' : key;
      return {
        attributeName: key,
        isHidden: false,
        exactMatch: true,
        label: label,
        type: FilterBarItemType.FREE_TEXT,
        freeTextValues: [this.settings.contextualFilters[key]],
      };
    });
  }

  ngOnDestroy(): void {
    this.terminator$.next(true);
    this.compareTerminator$.next(true);
    this.contextsFactory.destroyContext(this.context.id);
    this.updateBaseChartsSubscription.unsubscribe();
  }
}
