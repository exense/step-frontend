import { Optional, Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TreeAction } from '../shared/tree-action';
import { TreeActionsService } from '../services/tree-actions.service';
import { TreeNode } from '../shared/tree-node';

@Pipe({
  name: 'treeNodeActions',
})
export class TreeNodeActionsPipe implements PipeTransform {
  constructor(@Optional() private treeActions?: TreeActionsService) {}

  transform(node: TreeNode, multipleNodes?: boolean): Observable<TreeAction[]> {
    return !this.treeActions ? of([]) : this.treeActions.getActionsForNode(node, multipleNodes);
  }
}
