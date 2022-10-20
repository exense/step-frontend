import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { TreeStateService } from '../services/tree-state.service';

@Pipe({
  name: 'isRootNode',
})
export class IsRootNodePipe implements PipeTransform {
  constructor(private _treeState: TreeStateService) {}

  transform(nodeId: string): Observable<boolean> {
    return this._treeState.isRoot(nodeId);
  }
}
