import { Injectable, InjectionToken } from '@angular/core';
import { AggregatedReportView, TreeStateService } from '@exense/step-core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {}

export const AGGREGATED_TREE_TAB_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to tab',
);
export const AGGREGATED_TREE_WIDGET_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to widget',
);
