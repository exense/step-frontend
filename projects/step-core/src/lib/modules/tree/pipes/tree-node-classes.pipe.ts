import { inject, Pipe, PipeTransform } from '@angular/core';
import { TreeNodeUtilsService } from '../services/tree-node-utils.service';
import { TreeStateService } from '../services/tree-state.service';
import { TreeNode } from '../shared/tree-node';

@Pipe({
  name: 'treeNodeClasses',
})
export class TreeNodeClassesPipe implements PipeTransform {
  private _utils = inject(TreeNodeUtilsService, { optional: true });
  private _treeState = inject(TreeStateService, { optional: true });

  transform(treeNode: TreeNode): string[] {
    const result = ['node-container'];
    const node = this._treeState?.findNodeById?.(treeNode.id);
    if (!node) {
      return result;
    }
    const classes = this._utils?.getNodeAdditionalClasses?.(node) ?? [];
    result.push(...classes);
    return result;
  }
}
