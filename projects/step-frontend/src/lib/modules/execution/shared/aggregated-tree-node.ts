import { AbstractArtefact, AggregatedArtefactInfo, ArtefactTreeNode } from '@exense/step-core';

export enum AggregatedTreeNodeType {
  AGGREGATED_INFO,
  DETAILS_NODE,
  DETAILS_DATA,
  PSEUDO_CONTAINER,
}

export interface AggregatedTreeNode
  extends Omit<ArtefactTreeNode, 'nodeType'>,
    AggregatedArtefactInfo<AbstractArtefact> {
  countByStatus?: Record<string, number>;
  nodeType: AggregatedTreeNodeType;
  artefactId?: string;
  artefactHash?: string;
  hasDescendantInvocations?: boolean;
  countByErrorMessage?: Record<string, number>;
  countByChildrenErrorMessage?: Record<string, number>;
}
