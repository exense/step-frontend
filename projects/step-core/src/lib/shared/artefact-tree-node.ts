import { TreeNode } from '../modules/tree/tree.module';
import { AbstractArtefact } from '../client/generated';

export interface ArtefactTreeNode extends TreeNode {
  originalArtefact: AbstractArtefact;
}
