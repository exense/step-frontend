import { TreeNode } from '../../tree/tree.module';
import { AbstractArtefact, ChildrenBlock } from '../../../client/generated';
import { ArtefactNodeSource } from './artefact-node-source.enum';

export interface ArtefactTreeNode extends TreeNode {
  originalArtefact?: AbstractArtefact;
  childContainer?: ChildrenBlock;
  nodeType?: ArtefactNodeSource;
}
