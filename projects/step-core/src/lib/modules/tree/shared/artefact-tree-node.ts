import { TreeNode } from './tree-node';
import { AbstractArtefact } from '../../../client/generated';

export enum ArtefactTreeNodeType {
  artefact = 'artefact',
  before = 'before',
  items = 'items',
  after = 'after',
}

export interface ArtefactTreeNode extends TreeNode {
  originalArtefact?: AbstractArtefact;
  nodeType: ArtefactTreeNodeType;
}
