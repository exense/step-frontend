import { Observable } from 'rxjs';
import { TreeAction } from '../shared/tree-action';
import { TreeNode } from '../shared/tree-node';

export abstract class TreeActionsService {
  abstract getActionsForNode(node: TreeNode): Observable<TreeAction[]>;
  abstract hasActionsForNode(node: TreeNode): boolean;
}
