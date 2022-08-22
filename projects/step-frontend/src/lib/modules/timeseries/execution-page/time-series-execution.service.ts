import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesExecutionService {
  activeSelectionChange: BehaviorSubject<ExecutionTimeSelection> = new BehaviorSubject<ExecutionTimeSelection>({
    type: RangeSelectionType.FULL,
  });

  keywordsChange: BehaviorSubject<{ [key: string]: boolean }> = new BehaviorSubject<{ [key: string]: boolean }>({});
  onKeywordSelectionChange: Subject<{ keyword: string; isSelected: boolean }> = new Subject<{
    keyword: string;
    isSelected: boolean;
  }>();

  activeExecution: any;
  activeSelection: ExecutionTimeSelection = { type: RangeSelectionType.FULL };

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
