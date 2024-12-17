import { TreeNode } from '../../tree/tree.module';
import { AbstractArtefact } from '../../../client/generated';
import { ArtefactNodeSource } from './artefact-node-source.enum';

export interface ArtefactTreeNode extends TreeNode {
  originalArtefact?: AbstractArtefact;
  nodeType?: ArtefactNodeSource;
}
