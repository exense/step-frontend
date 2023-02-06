import { Pipe, PipeTransform } from '@angular/core';
import { TreeStateService } from '../services/tree-state.service';
import { TreeNode } from '../shared/tree-node';
import { Observable } from 'rxjs';

@Pipe({
  name: 'isNodeSelectedForInsert',
})
export class IsNodeSelectedForInsertPipe implements PipeTransform {
  constructor(private _treeState: TreeStateService<any, TreeNode>) {}
  transform(nodeId: string): Observable<boolean> {
    return this._treeState.isNodeSelectedForInsert(nodeId);
  }
}
