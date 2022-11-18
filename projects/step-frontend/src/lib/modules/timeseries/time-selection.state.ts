import { Observable, Subject } from 'rxjs';
import { ExecutionTimeSelection } from './time-selection/model/execution-time-selection';
import { RangeSelectionType } from './time-selection/model/range-selection-type';
import { TSTimeRange } from './chart/model/ts-time-range';

export class TimeSelectionState {
  private readonly zoomReset$ = new Subject<void>();
  private readonly activeSelectionChange$ = new Subject<ExecutionTimeSelection>();

  activeTimeSelection: ExecutionTimeSelection = { type: RangeSelectionType.FULL };

  resetZoom(range: TSTimeRange) {
    if (
      this.activeTimeSelection.type === RangeSelectionType.FULL &&
      this.activeTimeSelection.absoluteSelection?.from === range.from &&
      this.activeTimeSelection.absoluteSelection?.to === range.to
    ) {
      // nothing changed
      return;
    }
    this.activeTimeSelection = { type: RangeSelectionType.FULL, absoluteSelection: range };
    this.activeSelectionChange$.next(this.activeTimeSelection);
    console.log('Emiting change event: ', this.activeTimeSelection);
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
