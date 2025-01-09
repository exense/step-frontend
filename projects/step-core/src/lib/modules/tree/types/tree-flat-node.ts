import { TreeNode } from './tree-node';

export interface TreeFlatNode extends TreeNode {
  parentPath: string[];
  hasChild: boolean;
}
