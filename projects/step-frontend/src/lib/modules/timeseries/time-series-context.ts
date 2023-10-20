import { BehaviorSubject, Observable, skip, Subject } from 'rxjs';
import { TimeSeriesKeywordsContext } from './pages/execution-page/time-series-keywords.context';
import { TimeseriesColorsPool } from './util/timeseries-colors-pool';
import { Execution } from '@exense/step-core';
import { TSTimeRange } from './chart/model/ts-time-range';
import { TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';
import { TimeSeriesContextParams } from './time-series-context-params';
import { TsFilteringMode } from './model/ts-filtering-mode';
import { TsFilteringSettings } from './model/ts-filtering-settings';
import { FilterUtils } from './util/filter-utils';
import { TimeSeriesUtils } from './time-series-utils';
import { OQLBuilder } from './util/oql-builder';
import { TsCompareModeSettings } from './dashboard/model/ts-compare-mode-settings';

/**
 * This class is responsible for managing the state of an execution tab. Here we store time selection, colors, filters, etc.
 */
export class TimeSeriesContext {
  id!: string;
  activeExecution: Execution | undefined;
  filteringMode: TsFilteringMode = TsFilteringMode.STANDARD;

  compareModeChange$: BehaviorSubject<TsCompareModeSettings> = new BehaviorSubject<TsCompareModeSettings>({
    enabled: false,
  });

  inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private fullTimeRange: TSTimeRange; // this represents the entire time-series interval. usually this is displayed entirely in the time-ranger
  private readonly fullTimeRangeChange$: Subject<TSTimeRange> = new Subject<TSTimeRange>();
  private selectedTimeRange: TSTimeRange; // this is the zooming selection.
  private readonly selectedTimeRangeChange$: Subject<TSTimeRange> = new Subject<TSTimeRange>();

  private readonly activeGroupings$: BehaviorSubject<string[]>;

  private readonly activeFilters$: BehaviorSubject<TsFilterItem[]>;
  private readonly filterSettings$: BehaviorSubject<TsFilteringSettings>;
  private readonly chartsResolution$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public readonly keywordsContext: TimeSeriesKeywordsContext;
  private readonly colorsPool: TimeseriesColorsPool;

  constructor(params: TimeSeriesContextParams) {
    this.id = params.id;
    this.fullTimeRange = params.timeRange;
    this.selectedTimeRange = params.timeRange;
    this.activeFilters$ = new BehaviorSubject(params.filters || []);
    this.filterSettings$ = new BehaviorSubject<TsFilteringSettings>({
      mode: TsFilteringMode.STANDARD,
      oql: '',
      filterItems: params.filters || [],
    });
    this.activeGroupings$ = new BehaviorSubject(params.grouping);
    this.colorsPool = params.colorsPool || new TimeseriesColorsPool();
    this.keywordsContext = params.keywordsContext || new TimeSeriesKeywordsContext(this.colorsPool);
  }

  destroy(): void {
    this.inProgress$.complete();
    this.fullTimeRangeChange$.complete();
    this.selectedTimeRangeChange$.complete();
    this.activeGroupings$.complete();
    this.activeFilters$.complete();
    this.filterSettings$.complete();
  }

  enableCompareMode(context: TimeSeriesContext) {
    this.compareModeChange$.next({ enabled: true, context: context });
  }

  disableCompareMode() {
    this.compareModeChange$.next({ enabled: false });
  }

  onCompareModeChange(): Observable<{ enabled: boolean; context?: TimeSeriesContext }> {
    return this.compareModeChange$.asObservable();
  }

  onChartsResolutionChange(): Observable<number> {
    return this.chartsResolution$.asObservable();
  }

  updateChartsResolution(ms: number): void {
    this.chartsResolution$.next(ms);
  }

  getChartsResolution(): number {
    return this.chartsResolution$.getValue();
  }

  setInProgress(inProgress: boolean) {
    this.inProgress$.next(inProgress);
  }

  getDynamicFilters(): TsFilterItem[] {
    return this.activeFilters$.getValue();
  }

  inProgressChange() {
    return this.inProgress$.asObservable();
  }

  updateFilters(items: TsFilterItem[]) {
    this.activeFilters$.next(items);
  }

  updateFullRange(range: TSTimeRange, emitEvent = true) {
    this.fullTimeRange = range;
    if (emitEvent) {
      this.fullTimeRangeChange$.next(range);
    }
  }

  updateSelectedRange(range: TSTimeRange, emitEvent = true) {
    this.selectedTimeRange = range;
    if (emitEvent) {
      this.selectedTimeRangeChange$.next(range);
    }
  }

  onFullRangeChange(): Observable<TSTimeRange> {
    return this.fullTimeRangeChange$.asObservable();
  }

  onTimeSelectionChange(): Observable<TSTimeRange> {
    return this.selectedTimeRangeChange$.asObservable();
  }

  isFullRangeSelected() {
    return JSON.stringify(this.selectedTimeRange) === JSON.stringify(this.fullTimeRange);
  }

  getSelectedTimeRange(): TSTimeRange {
    return this.selectedTimeRange;
  }

  setFilteringMode(mode: TsFilteringMode): void {
    this.filteringMode = mode;
  }

  setFilteringSettings(settings: TsFilteringSettings): void {
    this.filterSettings$.next(settings);
  }

  getFilteringSettings(): TsFilteringSettings {
    return this.filterSettings$.getValue();
  }

  buildActiveOQL(includeTimeRange = true, removeAttributesPrefix = false): string {
    let filteringSettings = this.getFilteringSettings();
    const filtersOql =
      filteringSettings.mode === TsFilteringMode.OQL
        ? removeAttributesPrefix
          ? filteringSettings.oql.replace('attributes.', '')
          : filteringSettings.oql
        : FilterUtils.filtersToOQL(
            filteringSettings.filterItems,
            undefined,
            TimeSeriesUtils.ATTRIBUTES_REMOVAL_FUNCTION
          );
    const selectedTimeRange = this.getSelectedTimeRange();
    return new OQLBuilder()
      .open('and')
      .append(`(begin < ${Math.trunc(selectedTimeRange.to)} and begin > ${Math.trunc(selectedTimeRange.from)})`)
      .append(filtersOql)
      .build();
  }

  resetZoom() {
    if (JSON.stringify(this.selectedTimeRange) === JSON.stringify(this.fullTimeRange)) {
      // return; // this is causing some issues in the ranger. it's selection get 0 width, so better keep it like this for now.
    }
    this.selectedTimeRange = this.fullTimeRange;
    this.selectedTimeRangeChange$.next(this.selectedTimeRange);
  }

  setExecution(execution: Execution) {
    this.activeExecution = execution;
  }

  getExecution(): Execution {
    if (!this.activeExecution) {
      throw new Error('Execution was not set yet');
    }
    return this.activeExecution;
  }

  onGroupingChange(): Observable<string[]> {
    return this.activeGroupings$.asObservable().pipe(skip(1));
  }

  onFiltersChange(): Observable<TsFilterItem[]> {
    return this.activeFilters$.asObservable().pipe(skip(1));
  }

  onFilteringChange(): Observable<TsFilteringSettings> {
    return this.filterSettings$.asObservable().pipe(skip(1));
  }

  updateActiveFilters(items: TsFilterItem[]): void {
    this.activeFilters$.next(items);
  }

  updateGrouping(grouping: string[]) {
    this.activeGroupings$.next(grouping);
  }

  getGroupDimensions(): string[] {
    return this.activeGroupings$.getValue();
  }

  getFullTimeRange(): TSTimeRange {
    return this.fullTimeRange;
  }
}
