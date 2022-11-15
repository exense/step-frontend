import { Pipe, PipeTransform } from '@angular/core';
import { TreeStateService } from '../services/tree-state.service';
import { Observable } from 'rxjs';
import { TreeNode } from '../shared/tree-node';

@Pipe({
  name: 'isNodeSelected',
})
export class IsNodeSelectedPipe implements PipeTransform {
  constructor(private _treeState: TreeStateService<any, TreeNode>) {}

  transform(nodeId: string): Observable<boolean> {
    return this._treeState.isNodeSelected(nodeId);
  }
}
