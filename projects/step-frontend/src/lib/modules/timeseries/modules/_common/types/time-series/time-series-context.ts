import { BehaviorSubject, map, merge, Observable, skip, Subject, Subscription } from 'rxjs';
import { DashboardItem, Execution, MetricAttribute, MetricType, TimeRange } from '@exense/step-core';
import { TimeSeriesContextParams } from './time-series-context-params';
import { TsFilteringMode } from '../filter/ts-filtering-mode.enum';
import { TsFilteringSettings } from '../filter/ts-filtering-settings';
import { TimeseriesColorsPool } from './timeseries-colors-pool';
import { FilterUtils } from '../filter/filter-utils';
import { TimeSeriesUtils } from './time-series-utils';
import { OQLBuilder } from '../oql-builder';
import { TimeSeriesSyncGroup } from './time-series-sync-group';
import { SeriesStroke } from './series-stroke';
import { DashboardTimeRangeSettings } from '../../../../components/dashboard/dashboard-time-range-settings';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';

export interface TsCompareModeSettings {
  enabled: boolean;
  context?: TimeSeriesContext;
}

/**
 * This class is responsible for managing the state of an execution tab. Here we store time selection, colors, filters, etc.
 */
export class TimeSeriesContext {
  id!: string;
  filteringMode: TsFilteringMode = TsFilteringMode.STANDARD;

  readonly compareModeChange$ = new BehaviorSubject<TsCompareModeSettings>({ enabled: false });
  readonly editMode$: BehaviorSubject<boolean>;

  /**
   * General observable which emits when any part of the context has been change.
   */
  readonly stateChange$: Observable<void>;
  private stateChangeInternal$ = new Subject<void>();
  inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private dashboardAttributes$: BehaviorSubject<Record<string, MetricAttribute>>;

  private readonly fullTimeRangeChange$ = new Subject<TimeRange>();
  private readonly selectedTimeRangeChange$ = new Subject<TimeRange>();
  timeRangeSettings: DashboardTimeRangeSettings;
  timeRangeSettingsChange = new Subject<DashboardTimeRangeSettings>();

  private readonly activeGroupings$: BehaviorSubject<string[]>;

  private readonly filterSettings$: BehaviorSubject<TsFilteringSettings>;
  private readonly chartsResolution$: BehaviorSubject<number>;
  private readonly chartsLockedState$ = new BehaviorSubject<boolean>(false);
  private readonly refreshInterval$: BehaviorSubject<number>;

  public readonly colorsPool: TimeseriesColorsPool;

  private syncGroups: Record<string, TimeSeriesSyncGroup> = {}; // used for master-salve charts relationships

  private dashlets: DashboardItem[];
  private indexedMetrics: Record<string, MetricType> = {};

  constructor(params: TimeSeriesContextParams) {
    this.id = params.id;
    this.dashlets = params.dashlets;
    params.syncGroups?.forEach((group) => (this.syncGroups[group.id] = group));
    this.timeRangeSettings = params.timeRangeSettings;
    this.filterSettings$ = new BehaviorSubject<TsFilteringSettings>(params.filteringSettings);
    this.editMode$ = new BehaviorSubject<boolean>(params.editMode || false);
    this.activeGroupings$ = new BehaviorSubject(params.grouping);
    const attributes: Record<string, MetricAttribute> =
      params.attributes?.reduce(
        (acc, el) => {
          acc[el.name] = el;
          return acc;
        },
        {} as Record<string, MetricAttribute>,
      ) || {};
    this.dashboardAttributes$ = new BehaviorSubject<Record<string, MetricAttribute>>(attributes);
    this.colorsPool = params.colorsPool || new TimeseriesColorsPool();
    this.chartsResolution$ = new BehaviorSubject<number>(params.resolution || 0);
    this.refreshInterval$ = new BehaviorSubject<number>(params.refreshInterval || 0);
    params.metrics?.forEach((m) => (this.indexedMetrics[m.name] = m));

    // any specific context change will trigger the main stateChange
    this.stateChange$ = merge(
      this.compareModeChange$.pipe(skip(1)),
      this.inProgress$.pipe(skip(1)),
      this.activeGroupings$.pipe(skip(1)),
      this.filterSettings$.pipe(skip(1)),
      this.chartsResolution$.pipe(skip(1)),
      this.chartsLockedState$.pipe(skip(1)),
      this.refreshInterval$.pipe(skip(1)),
      this.fullTimeRangeChange$,
      this.selectedTimeRangeChange$,
      this.stateChangeInternal$,
    ) as Observable<void>;
  }

  getTimeRangeSettings() {
    return this.timeRangeSettings;
  }

  getMetric(key: string): MetricType {
    return this.indexedMetrics[key];
  }

  getRefreshInterval(): number {
    return this.refreshInterval$.getValue();
  }

  updateRefreshInterval(value: number) {
    this.refreshInterval$.next(value);
  }

  updateTimeRangeSettings(settings: DashboardTimeRangeSettings) {
    this.timeRangeSettings = settings;
    this.stateChangeInternal$.next();
    this.timeRangeSettingsChange.next(settings);
    // this.fullTimeRangeChange$.next(settings.fullRange);
  }

  onRefreshIntervalChange(): Observable<number> {
    return this.refreshInterval$.asObservable();
  }

  updateDefaultFullTimeRange(range: Partial<TimeRange>) {
    this.timeRangeSettings.defaultFullRange = range;
  }

  getSyncGroups(): TimeSeriesSyncGroup[] {
    return Object.values(this.syncGroups);
  }

  getDashlets(): DashboardItem[] {
    return this.dashlets;
  }

  updateDashlets(dashlets: DashboardItem[]): void {
    this.dashlets = dashlets;
  }

  getDashlet(id: string): DashboardItem | undefined {
    return this.dashlets.find((i) => i.id === id);
  }

  destroy(): void {
    this.inProgress$.complete();
    this.fullTimeRangeChange$.complete();
    this.refreshInterval$.complete();
    this.selectedTimeRangeChange$.complete();
    this.activeGroupings$.complete();
    this.filterSettings$.complete();
    this.chartsLockedState$.complete();
    this.stateChangeInternal$.complete();
    Object.keys(this.syncGroups).forEach((key) => this.syncGroups[key]?.destroy());
  }

  getStrokeColor(key: string): SeriesStroke {
    return this.colorsPool.getSeriesColor(key);
  }

  getSyncGroup(key: string): TimeSeriesSyncGroup {
    let syncGroup = this.syncGroups[key];
    if (!syncGroup) {
      this.syncGroups[key] = syncGroup = new TimeSeriesSyncGroup(key);
      // throw new Error('Sync group not found: ' + key);
    }
    return syncGroup;
  }

  updateEditMode(enabled: boolean) {
    this.editMode$.next(enabled);
  }

  /**
   * This method will not trigger change event, only if there are real changes in at least one attribute, added or removed
   */
  updateAttributes(attributes: MetricAttribute[]): void {
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
    this.compareModeChange$.getValue()?.context?.destroy();
    this.compareModeChange$.next({ enabled: false });
  }

  onCompareModeChange(): Observable<{ enabled: boolean; context?: TimeSeriesContext }> {
    return this.compareModeChange$.asObservable();
  }

  onChartsResolutionChange(): Observable<number> {
    return this.chartsResolution$.asObservable().pipe(skip(1));
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

  inProgressChange() {
    return this.inProgress$.asObservable();
  }

  getChartsLockedState(): boolean {
    return this.chartsLockedState$.getValue();
  }

  setChartsLockedState(state: boolean): void {
    this.chartsLockedState$.next(state);
  }

  updateFullRange(range: TimeRange, emitEvent = true) {
    this.timeRangeSettings.fullRange = range;
    if (emitEvent) {
      this.fullTimeRangeChange$.next(range);
    } else {
      this.stateChangeInternal$.next();
    }
  }

  updateSelectedRange(range: TimeRange, emitEvent = true) {
    this.timeRangeSettings.selectedRange = range;
    if (emitEvent) {
      this.selectedTimeRangeChange$.next(range);
    } else {
      this.stateChangeInternal$.next();
    }
  }

  onFullRangeChange(): Observable<TimeRange> {
    return this.fullTimeRangeChange$.asObservable();
  }

  onTimeSelectionChange(): Observable<TimeRange> {
    return this.selectedTimeRangeChange$.asObservable();
  }

  isFullRangeSelected() {
    return (
      this.timeRangeSettings.fullRange.from === this.timeRangeSettings.selectedRange.from &&
      this.timeRangeSettings.fullRange.to === this.timeRangeSettings.selectedRange.to
    );
  }

  getSelectedTimeRange(): TimeRange {
    return this.timeRangeSettings.selectedRange;
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
          ? filteringSettings.oql!.replace('attributes.', '')
          : filteringSettings.oql!
        : FilterUtils.filtersToOQL(
            [...filteringSettings.filterItems, ...(filteringSettings.hiddenFilters || [])],
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
    this.timeRangeSettings.selectedRange = this.timeRangeSettings.fullRange;
    this.selectedTimeRangeChange$.next(this.timeRangeSettings.selectedRange);
  }

  onGroupingChange(): Observable<string[]> {
    return this.activeGroupings$.asObservable().pipe(skip(1));
  }

  onTimePickerOptionChange(): Observable<TimeRangePickerSelection> {
    return this.timeRangeSettingsChange.asObservable().pipe(map((settings) => settings.pickerSelection));
  }

  onFilteringChange(): Observable<TsFilteringSettings> {
    return this.filterSettings$.asObservable().pipe(skip(1));
  }

  updateGrouping(grouping: string[]) {
    this.activeGroupings$.next(grouping);
  }

  getGroupDimensions(): string[] {
    return this.activeGroupings$.getValue();
  }

  getFullTimeRange(): TimeRange {
    return this.timeRangeSettings.fullRange;
  }
}
