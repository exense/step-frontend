import { TreeNode } from '@exense/step-core';
import { ReportNodeWithChildren } from './report-node-with-children';

export interface ReportTreeNode extends TreeNode {
  originalNode?: ReportNodeWithChildren;
}
