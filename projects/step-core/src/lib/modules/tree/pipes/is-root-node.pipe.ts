import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { TreeStateService } from '../services/tree-state.service';
import { TreeNode } from '../shared/tree-node';

@Pipe({
  name: 'isRootNode',
})
export class IsRootNodePipe implements PipeTransform {
  constructor(private _treeState: TreeStateService<any, TreeNode>) {}

  transform(nodeId: string): Observable<boolean> {
    return this._treeState.isRoot(nodeId);
  }
}
