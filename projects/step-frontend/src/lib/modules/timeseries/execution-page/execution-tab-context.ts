import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';
import { Execution } from '@exense/step-core';
import { BucketFilters } from '../model/bucket-filters';

/**
 * This class is responsible for managing the state of an execution tab. Here we store time selection, colors, filters, etc.
 */
export class ExecutionTabContext {
  executionId!: string;

  activeTimeSelection: ExecutionTimeSelection = { type: RangeSelectionType.FULL };
  activeExecution: Execution | undefined;
  activeFilters: { [key: string]: any } = {};

  private readonly activeSelectionChange: BehaviorSubject<ExecutionTimeSelection> =
    new BehaviorSubject<ExecutionTimeSelection>(this.activeTimeSelection);
  private readonly filtersChangeSubject: Subject<BucketFilters> = new Subject();

  private readonly keywordsContext: TimeSeriesKeywordsContext;
  private readonly colorsPool: TimeseriesColorsPool;

  constructor(executionId: string) {
    this.executionId = executionId;
    this.colorsPool = new TimeseriesColorsPool();
    this.keywordsContext = new TimeSeriesKeywordsContext(this.colorsPool);
  }

  getKeywordsContext(): TimeSeriesKeywordsContext {
    return this.keywordsContext;
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

  setActiveSelection(selection: ExecutionTimeSelection) {
    this.activeTimeSelection = selection;
    this.activeSelectionChange.next(selection);
  }

  getActiveSelection(): ExecutionTimeSelection {
    return this.activeTimeSelection;
  }

  onActiveSelectionChange(): Observable<ExecutionTimeSelection> {
    return this.activeSelectionChange.asObservable();
  }

  onFiltersChange(): Observable<BucketFilters> {
    return this.filtersChangeSubject.asObservable();
  }

  updateFilters(filters: BucketFilters): void {
    this.filtersChangeSubject.next(filters);
  }
}
