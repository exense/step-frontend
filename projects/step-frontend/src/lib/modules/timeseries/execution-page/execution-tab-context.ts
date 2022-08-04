import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { TimeseriesColorsPool } from '../util/timeseries-colors-pool';

export class ExecutionTabContext {
  executionId!: string;

  activeSelectionChange: BehaviorSubject<ExecutionTimeSelection> = new BehaviorSubject<ExecutionTimeSelection>({
    type: RangeSelectionType.FULL,
  });

  activeExecution: any;
  activeSelection: ExecutionTimeSelection = { type: RangeSelectionType.FULL };

  private keywordsContext: TimeSeriesKeywordsContext;
  private colorsPool: TimeseriesColorsPool;

  constructor(executionId: string) {
    this.executionId = executionId;
    this.colorsPool = new TimeseriesColorsPool();
    this.keywordsContext = new TimeSeriesKeywordsContext(this.colorsPool);
  }

  getKeywordsContext(): TimeSeriesKeywordsContext {
    return this.keywordsContext;
  }

  setExecution(execution: any) {
    this.activeExecution = execution;
  }

  getExecution() {
    return this.activeExecution;
  }

  setActiveSelection(selection: ExecutionTimeSelection) {
    this.activeSelection = selection;
    this.activeSelectionChange.next(selection);
  }

  getActiveSelection(): ExecutionTimeSelection {
    return this.activeSelection;
  }

  onActiveSelectionChange(): Observable<ExecutionTimeSelection> {
    return this.activeSelectionChange.asObservable();
  }
}
