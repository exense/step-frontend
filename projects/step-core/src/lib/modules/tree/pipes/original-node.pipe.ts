import { inject, Pipe, PipeTransform } from '@angular/core';
import { TreeNode, TreeStateService } from '@exense/step-core';

@Pipe({
  name: 'originalNode',
  standalone: true,
})
export class OriginalNodePipe implements PipeTransform {
  private _treeState = inject(TreeStateService, { optional: true });

  transform(node: TreeNode): unknown {
    return this._treeState?.findNodeById(node.id);
  }
}
