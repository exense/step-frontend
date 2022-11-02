import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';
import { Execution } from '@exense/step-core';
import { BucketFilters } from '../model/bucket-filters';
import { TimeSelectionState } from '../time-selection.state';

/**
 * This class is responsible for managing the state of an execution tab. Here we store time selection, colors, filters, etc.
 */
export class TimeSeriesContext {
  executionId!: string;

  activeExecution: Execution | undefined;
  activeFilters: { [key: string]: any } = {};
  activeGroupings: string[] = ['name']; // group dimensions

  private readonly filtersChangeSubject: Subject<BucketFilters> = new Subject();
  private readonly groupingChangeSubject: Subject<string[]> = new Subject();

  public readonly keywordsContext: TimeSeriesKeywordsContext;
  private readonly colorsPool: TimeseriesColorsPool;
  readonly timeSelectionState: TimeSelectionState;

  constructor(executionId: string) {
    this.executionId = executionId;
    this.colorsPool = new TimeseriesColorsPool();
    this.keywordsContext = new TimeSeriesKeywordsContext(this.colorsPool);
    this.timeSelectionState = new TimeSelectionState();
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
