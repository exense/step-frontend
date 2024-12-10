import { inject, Pipe, PipeTransform } from '@angular/core';
import { TreeActionsService, TreeNode } from '@exense/step-core';

@Pipe({
  name: 'treeNodeHasActions',
})
export class TreeNodeHasActionsPipe implements PipeTransform {
  private _treeActions? = inject(TreeActionsService, { optional: true });
  transform(node: TreeNode): boolean {
    return !this._treeActions ? false : this._treeActions.hasActionsForNode(node);
  }
}
