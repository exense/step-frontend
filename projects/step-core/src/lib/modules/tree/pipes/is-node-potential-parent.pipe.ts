import { Optional, Pipe, PipeTransform } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { InsertPotentialParentStateService } from '../services/insert-potential-parent-state.service';

@Pipe({
  name: 'isNodePotentialParent',
})
export class IsNodePotentialParentPipe implements PipeTransform {
  constructor(@Optional() private _insertPotentialParentState?: InsertPotentialParentStateService) {}

  transform(nodeId: string): Observable<boolean> {
    if (!this._insertPotentialParentState || !nodeId) {
      return of(false);
    }
    return this._insertPotentialParentState.potentialParentId$.pipe(
      map((potentialParentId) => potentialParentId === nodeId)
    );
  }
}
