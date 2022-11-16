import { AbstractArtefact, TreeNode } from '@exense/step-core';

export interface ArtefactTreeNode extends TreeNode {
  originalArtefact: AbstractArtefact;
}
