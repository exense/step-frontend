import { inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TreeAction } from '../types/tree-action';
import { TreeActionsService } from '../services/tree-actions.service';
import { TreeNode } from '../types/tree-node';

@Pipe({
  name: 'treeNodeActions',
  standalone: true,
})
export class TreeNodeActionsPipe implements PipeTransform {
  private _treeActions? = inject(TreeActionsService, { optional: true });

  transform(node: TreeNode, multipleNodes?: boolean): Observable<TreeAction[]> {
    return !this._treeActions ? of([]) : this._treeActions.getActionsForNode(node, multipleNodes);
  }
}
