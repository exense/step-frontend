import { AbstractArtefact, ArtefactTreeNode } from '@exense/step-core';

export enum AggregatedTreeNodeType {
  KEYWORD,
  DETAILS_NODE,
  DETAILS_DATA,
}

export interface AggregatedTreeNode extends ArtefactTreeNode {
  countByStatus?: Record<string, number>;
  nodeType: AggregatedTreeNodeType;
}
