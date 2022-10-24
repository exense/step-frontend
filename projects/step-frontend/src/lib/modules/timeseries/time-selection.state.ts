import { Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from './time-selection/model/execution-time-selection';
import { RangeSelectionType } from './time-selection/model/range-selection-type';

export class TimeSelectionState {
  private readonly zoomReset$ = new Subject<void>();
  private readonly activeSelectionChange$ = new Subject<ExecutionTimeSelection>();

  activeTimeSelection: ExecutionTimeSelection = { type: RangeSelectionType.FULL };

  resetZoom() {
    this.activeTimeSelection = { type: RangeSelectionType.FULL };
    this.zoomReset$.next();
  }

  onZoomReset() {
    return this.zoomReset$.asObservable();
  }

  setActiveSelection(selection: ExecutionTimeSelection) {
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
