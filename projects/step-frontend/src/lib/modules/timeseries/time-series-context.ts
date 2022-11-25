import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from './time-selection/model/execution-time-selection';
import { RangeSelectionType } from './time-selection/model/range-selection-type';
import { TimeSeriesKeywordsContext } from './execution-page/time-series-keywords.context';
import { TimeseriesColorsPool } from './util/timeseries-colors-pool';
import { Execution } from '@exense/step-core';
import { BucketFilters } from './model/bucket-filters';
import { TimeSelectionState } from './time-selection.state';
import { TSTimeRange } from './chart/model/ts-time-range';

/**
 * This class is responsible for managing the state of an execution tab. Here we store time selection, colors, filters, etc.
 */
export class TimeSeriesContext {
  executionId!: string;
  activeExecution: Execution | undefined;

  fullTimeRange: TSTimeRange; // this represents the entire time-series interval. usually this is displayed entirely in the time-ranger
  selectedTimeRange: TSTimeRange; // this is the zooming selection.
  private readonly selectedTimeRange$: Subject<TSTimeRange> = new Subject<TSTimeRange>();

  activeGroupings: string[] = ['name']; // group dimensions
  private readonly groupingChangeSubject: Subject<string[]> = new Subject();

  activeFilters: { [key: string]: any } = {};
  private readonly filtersChangeSubject: Subject<BucketFilters> = new Subject();

  public readonly keywordsContext: TimeSeriesKeywordsContext;
  private readonly colorsPool: TimeseriesColorsPool;

  constructor(executionId: string, timeRange: TSTimeRange) {
    this.executionId = executionId;
    this.fullTimeRange = timeRange;
    this.selectedTimeRange = timeRange;
    this.colorsPool = new TimeseriesColorsPool();
    this.keywordsContext = new TimeSeriesKeywordsContext(this.colorsPool);
  }

  updateFullRange(range: TSTimeRange) {
    this.fullTimeRange = range;
    this.selectedTimeRange = range;
  }

  onSelectedTimeRangeChange(): Observable<TSTimeRange> {
    return this.selectedTimeRange$.asObservable();
  }

  isFullRangeSelected() {
    return JSON.stringify(this.selectedTimeRange) === JSON.stringify(this.fullTimeRange);
  }

  getSelectedTimeRange(): TSTimeRange {
    return this.selectedTimeRange;
  }

  setSelectedTimeRange(range: TSTimeRange) {
    this.selectedTimeRange = range;
    this.selectedTimeRange$.next(range);
  }

  resetZoom() {
    if (JSON.stringify(this.selectedTimeRange) === JSON.stringify(this.fullTimeRange)) {
      return;
    }
    this.selectedTimeRange = this.fullTimeRange;
    this.selectedTimeRange$.next(this.selectedTimeRange);
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
}
