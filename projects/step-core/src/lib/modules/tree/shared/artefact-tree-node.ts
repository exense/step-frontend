import { TreeNode } from './tree-node';
import { AbstractArtefact } from '../../../client/generated';

export interface ArtefactTreeNode extends TreeNode {
  originalArtefact: AbstractArtefact;
}
