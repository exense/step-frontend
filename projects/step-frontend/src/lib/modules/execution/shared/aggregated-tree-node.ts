import { AggregatedArtefactInfo, ArtefactTreeNode } from '@exense/step-core';

export enum AggregatedTreeNodeType {
  KEYWORD,
  DETAILS_NODE,
  DETAILS_DATA,
}

export interface AggregatedTreeNode extends ArtefactTreeNode, AggregatedArtefactInfo {
  countByStatus?: Record<string, number>;
  // nodeType: AggregatedTreeNodeType;
}
