import { TreeFlatNode } from './tree-flat-node';
import { TreeNode } from './tree-node';

export interface FlattenTreeData {
  tree: TreeFlatNode[];
  accessCache: Map<string, TreeNode>;
  parentsCache: Map<string, string | undefined>;
}
