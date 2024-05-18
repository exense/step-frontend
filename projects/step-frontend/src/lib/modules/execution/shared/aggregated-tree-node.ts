import { ArtefactTreeNode } from '@exense/step-core';

export interface AggregatedTreeNode extends ArtefactTreeNode {
  countByStatus?: Record<string, number>;
}
