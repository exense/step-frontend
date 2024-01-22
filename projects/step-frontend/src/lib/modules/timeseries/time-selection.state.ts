import { Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from './time-selection/model/execution-time-selection';
import { TimeRange } from '@exense/step-core';

export class TimeSelectionState {
  private readonly zoomReset$ = new Subject<void>();
  private readonly activeSelectionChange$ = new Subject<ExecutionTimeSelection>();

  activeTimeSelection: ExecutionTimeSelection = { type: 'FULL' };

  resetZoom(range: TimeRange) {
    if (
      this.activeTimeSelection.type === 'FULL' &&
      this.activeTimeSelection.absoluteSelection?.from === range.from &&
      this.activeTimeSelection.absoluteSelection?.to === range.to
    ) {
      // nothing changed
      return;
    }
    this.activeTimeSelection = { type: 'FULL', absoluteSelection: range };
    this.activeSelectionChange$.next(this.activeTimeSelection);
    this.zoomReset$.next();
  }

  onZoomReset() {
    return this.zoomReset$.asObservable();
  }

  setActiveSelection(selection: ExecutionTimeSelection) {
    if (this.activeTimeSelection.absoluteSelection === selection.absoluteSelection) {
      return;
    }
    this.activeTimeSelection = selection;
    this.activeSelectionChange$.next(selection);
  }

  getActiveSelection(): ExecutionTimeSelection {
    return this.activeTimeSelection;
  }

  onActiveSelectionChange(): Observable<ExecutionTimeSelection> {
    return this.activeSelectionChange$.asObservable();
  }
}
