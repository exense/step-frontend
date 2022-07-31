import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExecutionTimeSelection } from '../time-selection/model/execution-time-selection';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesExecutionService {
  activeSelectionChange: BehaviorSubject<ExecutionTimeSelection> = new BehaviorSubject<ExecutionTimeSelection>({
    type: RangeSelectionType.FULL,
  });

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
