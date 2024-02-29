import { BehaviorSubject, Observable, skip, Subject } from 'rxjs';
import { Execution, MetricAttribute, TimeRange } from '@exense/step-core';
import { TimeSeriesContextParams } from './time-series-context-params';
import { TsFilteringMode } from '../filter/ts-filtering-mode.enum';
import { FilterBarItem } from '../filter/filter-bar-item';
import { TsFilteringSettings } from '../filter/ts-filtering-settings';
import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { TimeseriesColorsPool } from './timeseries-colors-pool';
import { FilterUtils } from '../filter/filter-utils';
import { TimeSeriesUtils } from './time-series-utils';
import { OQLBuilder } from '../oql-builder';

export interface TsCompareModeSettings {
  enabled: boolean;
  context?: TimeSeriesContext;
}

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

  private dashboardAttributes$: BehaviorSubject<Record<string, MetricAttribute>>;

  private fullTimeRange: TimeRange; // this represents the entire time-series interval. usually this is displayed entirely in the time-ranger
  private readonly fullTimeRangeChange$: Subject<TimeRange> = new Subject<TimeRange>();
  private selectedTimeRange: TimeRange; // this is the zooming selection.
  private readonly selectedTimeRangeChange$: Subject<TimeRange> = new Subject<TimeRange>();

  private readonly activeGroupings$: BehaviorSubject<string[]>;

  private readonly activeFilters$: BehaviorSubject<FilterBarItem[]>;
  private readonly filterSettings$: BehaviorSubject<TsFilteringSettings>;
  private readonly chartsResolution$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private readonly chartsLockedState$ = new BehaviorSubject<boolean>(false);

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
    this.dashboardAttributes$ = new BehaviorSubject<Record<string, MetricAttribute>>(params.attributes || {});
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
    this.chartsLockedState$.complete();
  }

  /**
   * This method will not trigger change event, only if there are real changes in at least one attribute, added or removed
   */
  updateAttributes(attributes: MetricAttribute[]): void {
    attributes.forEach((newAttr) => {
      newAttributesByIds[newAttr.name] = newAttr;
    });
    const existingAttributes = this.dashboardAttributes$.getValue();
    const existingAttributesSize = Object.keys(existingAttributes).length;
    let hasChanges = attributes.length !== existingAttributesSize;
    if (!hasChanges) {
      // additional cycle to check all items is performed if lengths are not equal
      hasChanges = attributes.some((newAttr) => !existingAttributes[newAttr.name]);
    }
    if (!hasChanges) {
      // no need to do anything else
      return;
    }
    // perform the final aggregation, when it really required
    const newAttributesByIds = attributes.reduce(
      (res, newAttr) => {
        res[newAttr.name] = newAttr;
        return res;
      },
      {} as Record<string, MetricAttribute>,
    );
    this.dashboardAttributes$.next(newAttributesByIds);
  }

  onAttributesChange(): Observable<Record<string, MetricAttribute>> {
    return this.dashboardAttributes$.asObservable();
  }

  getAllAttributes(): MetricAttribute[] {
    return Object.values(this.dashboardAttributes$.getValue());
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

  getDynamicFilters(): FilterBarItem[] {
    return this.activeFilters$.getValue();
  }

  inProgressChange() {
    return this.inProgress$.asObservable();
  }

  updateFilters(items: FilterBarItem[]) {
    this.activeFilters$.next(items);
  }

  getChartsLockedState(): boolean {
    return this.chartsLockedState$.getValue();
  }

  setChartsLockedState(state: boolean): void {
    this.chartsLockedState$.next(state);
  }

  updateFullRange(range: TimeRange, emitEvent = true) {
    this.fullTimeRange = range;
    if (emitEvent) {
      this.fullTimeRangeChange$.next(range);
    }
  }

  updateSelectedRange(range: TimeRange, emitEvent = true) {
    this.selectedTimeRange = range;
    if (emitEvent) {
      this.selectedTimeRangeChange$.next(range);
    }
  }

  onFullRangeChange(): Observable<TimeRange> {
    return this.fullTimeRangeChange$.asObservable();
  }

  onTimeSelectionChange(): Observable<TimeRange> {
    return this.selectedTimeRangeChange$.asObservable();
  }

  isFullRangeSelected() {
    return JSON.stringify(this.selectedTimeRange) === JSON.stringify(this.fullTimeRange);
  }

  getSelectedTimeRange(): TimeRange {
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
            TimeSeriesUtils.ATTRIBUTES_REMOVAL_FUNCTION,
          );
    const selectedTimeRange = this.getSelectedTimeRange();
    return new OQLBuilder()
      .open('and')
      .append(`(begin < ${Math.trunc(selectedTimeRange.to!)} and begin > ${Math.trunc(selectedTimeRange.from!)})`)
      .append(filtersOql)
      .build();
  }

  resetZoom() {
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

  onFiltersChange(): Observable<FilterBarItem[]> {
    return this.activeFilters$.asObservable().pipe(skip(1));
  }

  onFilteringChange(): Observable<TsFilteringSettings> {
    return this.filterSettings$.asObservable().pipe(skip(1));
  }

  updateActiveFilters(items: FilterBarItem[]): void {
    this.activeFilters$.next(items);
  }

  updateGrouping(grouping: string[]) {
    this.activeGroupings$.next(grouping);
  }

  getGroupDimensions(): string[] {
    return this.activeGroupings$.getValue();
  }

  getFullTimeRange(): TimeRange {
    return this.fullTimeRange;
  }
}
