import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from './time-selection/model/execution-time-selection';
import { RangeSelectionType } from './time-selection/model/range-selection-type';
import { TimeSeriesKeywordsContext } from './execution-page/time-series-keywords.context';
import { TimeseriesColorsPool } from './util/timeseries-colors-pool';
import { Execution } from '@exense/step-core';
import { BucketFilters } from './model/bucket-filters';
import { TimeSelectionState } from './time-selection.state';
import { TSTimeRange } from './chart/model/ts-time-range';
import { TimeSeriesUtils } from './time-series-utils';
import { TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';

/**
 * This class is responsible for managing the state of an execution tab. Here we store time selection, colors, filters, etc.
 */
export class TimeSeriesContext {
  executionId!: string;
  activeExecution: Execution | undefined;

  inProgress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private fullTimeRange: TSTimeRange; // this represents the entire time-series interval. usually this is displayed entirely in the time-ranger
  private readonly fullTimeRangeChange$: Subject<TSTimeRange> = new Subject<TSTimeRange>();
  private selectedTimeRange: TSTimeRange; // this is the zooming selection.
  private readonly selectedTimeRangeChange$: Subject<TSTimeRange> = new Subject<TSTimeRange>();

  activeGroupings: string[] = ['name']; // group dimensions
  private readonly groupingChangeSubject: Subject<string[]> = new Subject();

  activeFilters: { [key: string]: any } = {};
  private readonly filtersChangeSubject: Subject<BucketFilters> = new Subject();

  activeFilter: TsFilterItem[] = [];
  private readonly activeFilter$: Subject<TsFilterItem[]> = new Subject();

  public readonly keywordsContext: TimeSeriesKeywordsContext;
  private readonly colorsPool: TimeseriesColorsPool;

  constructor(executionId: string, timeRange: TSTimeRange) {
    this.executionId = executionId;
    this.fullTimeRange = timeRange;
    this.selectedTimeRange = timeRange;
    this.colorsPool = new TimeseriesColorsPool();
    this.keywordsContext = new TimeSeriesKeywordsContext(this.colorsPool);
  }

  setInProgress(inProgress: boolean) {
    this.inProgress$.next(inProgress);
  }

  inProgressChange() {
    return this.inProgress$.asObservable();
  }

  onActiveFilterChange(): Observable<TsFilterItem[]> {
    return this.activeFilter$.asObservable();
  }

  updateFilter(items: TsFilterItem[]) {
    this.activeFilter = items;
    this.activeFilter$.next(this.activeFilter);
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

  onSelectedTimeRangeChange(): Observable<TSTimeRange> {
    return this.selectedTimeRangeChange$.asObservable();
  }

  isFullRangeSelected() {
    return JSON.stringify(this.selectedTimeRange) === JSON.stringify(this.fullTimeRange);
  }

  getSelectedTimeRange(): TSTimeRange {
    return this.selectedTimeRange;
  }

  resetZoom() {
    if (JSON.stringify(this.selectedTimeRange) === JSON.stringify(this.fullTimeRange)) {
      console.log('nothing changed');
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
    return this.groupingChangeSubject.asObservable();
  }

  onFiltersChange(): Observable<BucketFilters> {
    return this.filtersChangeSubject.asObservable();
  }

  updateActiveFilters(items: TsFilterItem[]) {
    this.activeFilter = items;
    this.activeFilter$.next(this.activeFilter);
  }

  updateFilters(filters: BucketFilters): void {
    this.activeFilters = filters;
    this.filtersChangeSubject.next(filters);
  }

  updateGrouping(grouping: string[]) {
    this.activeGroupings = grouping;
    this.groupingChangeSubject.next(grouping);
  }

  getGroupDimensions(): string[] {
    return this.activeGroupings;
  }

  getActiveFilters(): BucketFilters {
    return this.activeFilters;
  }

  getActiveFilter(): TsFilterItem[] {
    return this.activeFilter;
  }

  getFullTimeRange(): TSTimeRange {
    return this.fullTimeRange;
  }
}
