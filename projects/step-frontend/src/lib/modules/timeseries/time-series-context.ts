import { BehaviorSubject, Observable, skip, Subject } from 'rxjs';
import { TimeSeriesKeywordsContext } from './execution-page/time-series-keywords.context';
import { TimeseriesColorsPool } from './util/timeseries-colors-pool';
import { Execution } from '@exense/step-core';
import { TSTimeRange } from './chart/model/ts-time-range';
import { TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';
import { TimeSeriesContextParams } from './time-series-context-params';
import { TsFilteringMode } from './model/ts-filtering-mode';
import { TsFilteringSettings } from './model/ts-filtering-settings';

/**
 * This class is responsible for managing the state of an execution tab. Here we store time selection, colors, filters, etc.
 */
export class TimeSeriesContext {
  id!: string;
  activeExecution: Execution | undefined;
  filteringMode: TsFilteringMode = TsFilteringMode.STANDARD;

  inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private fullTimeRange: TSTimeRange; // this represents the entire time-series interval. usually this is displayed entirely in the time-ranger
  private readonly fullTimeRangeChange$: Subject<TSTimeRange> = new Subject<TSTimeRange>();
  private selectedTimeRange: TSTimeRange; // this is the zooming selection.
  private readonly selectedTimeRangeChange$: Subject<TSTimeRange> = new Subject<TSTimeRange>();

  private readonly activeGroupings$: BehaviorSubject<string[]>;

  private readonly baseFilters: { [key: string]: any }; // these are usually the contextual filters (e.g execution id, task id, etc)
  private readonly activeFilters$: BehaviorSubject<TsFilterItem[]>;
  private readonly filterSettings$: BehaviorSubject<TsFilteringSettings>;

  public readonly keywordsContext: TimeSeriesKeywordsContext;
  private readonly colorsPool: TimeseriesColorsPool;

  constructor(params: TimeSeriesContextParams) {
    this.id = params.id;
    this.fullTimeRange = params.timeRange;
    this.selectedTimeRange = params.timeRange;
    this.baseFilters = params.baseFilters;
    this.activeFilters$ = new BehaviorSubject(params.dynamicFilters || []);
    this.filterSettings$ = new BehaviorSubject<TsFilteringSettings>({
      mode: TsFilteringMode.STANDARD,
      oql: '',
      baseFilters: params.baseFilters,
      filterItems: params.dynamicFilters || [],
    });
    this.activeGroupings$ = new BehaviorSubject(params.grouping);
    this.colorsPool = new TimeseriesColorsPool();
    this.keywordsContext = new TimeSeriesKeywordsContext(this.colorsPool);
  }

  destroy(): void {
    this.inProgress$.complete();
    this.fullTimeRangeChange$.complete();
    this.selectedTimeRangeChange$.complete();
    this.activeGroupings$.complete();
    this.activeFilters$.complete();
    this.filterSettings$.complete();
  }

  setInProgress(inProgress: boolean) {
    this.inProgress$.next(inProgress);
  }

  getBaseFilters(): { [key: string]: any } {
    return this.getFilteringSettings().baseFilters;
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
