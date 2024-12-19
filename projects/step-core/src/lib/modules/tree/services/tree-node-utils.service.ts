import { Observable } from 'rxjs';
import { TreeNode } from '../shared/tree-node';

export abstract class TreeNodeUtilsService<T, N extends TreeNode> {
  abstract updateChildren(root: T, nodeId: string, children: N[], updateType: 'append' | 'replace'): void;
  abstract convertItem(item: T, params?: { parentId?: string; isParentVisuallySkipped?: boolean }): N;
  abstract updateNodeData(root: T, nodeId: string, data: Partial<Pick<TreeNode, 'name' | 'isSkipped'>>): boolean;
  abstract hasChildren?(nodeId: string): boolean;
  abstract loadChildren?(node: N): Observable<unknown>;
  abstract restoreTree?(root: T, nodeIdsToRestore: string[]): Observable<unknown>;
  abstract getNodeAdditionalClasses?(node: N): string[];
}
