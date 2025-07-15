import { inject, Pipe, PipeTransform } from '@angular/core';
import { TreeNode } from '../types/tree-node';
import { TreeStateService } from '../services/tree-state.service';

@Pipe({
  name: 'originalNode',
})
export class OriginalNodePipe implements PipeTransform {
  private _treeState = inject(TreeStateService, { optional: true });

  transform(node: TreeNode): unknown {
    return this._treeState?.findNodeById(node.id);
  }
}
