import { Observable } from 'rxjs';
import { TreeAction } from '../types/tree-action';
import { TreeNode } from '../types/tree-node';

export abstract class TreeActionsService {
  abstract getActionsForNode(node: TreeNode, multipleNodes?: boolean): Observable<TreeAction[]>;
  abstract hasActionsForNode(node: TreeNode): boolean;
}
