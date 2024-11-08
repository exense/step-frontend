import { AbstractArtefact, AggregatedArtefactInfo, ArtefactTreeNode } from '@exense/step-core';

export enum AggregatedTreeNodeType {
  AGGREGATED_INFO,
  DETAILS_NODE,
  DETAILS_DATA,
}

export interface AggregatedTreeNode extends ArtefactTreeNode, AggregatedArtefactInfo<AbstractArtefact> {
  countByStatus?: Record<string, number>;
  nodeType: AggregatedTreeNodeType;
  artefactHash?: string;
}
