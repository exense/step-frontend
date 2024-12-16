import { Injectable, InjectionToken, signal } from '@angular/core';
import { AggregatedReportView, TreeStateService } from '@exense/step-core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {
  private visibleInfosInternal = signal<Record<string, boolean>>({});
  readonly visibleInfos = this.visibleInfosInternal.asReadonly();

  toggleInfo(node: AggregatedTreeNode): void {
    const isVisible = !!this.visibleInfosInternal()[node.id!];
    this.visibleInfosInternal.update((value) => ({
      ...value,
      [node.id!]: !isVisible,
    }));
  }
}

export const AGGREGATED_TREE_TAB_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to tab',
);
export const AGGREGATED_TREE_WIDGET_STATE = new InjectionToken<AggregatedReportViewTreeStateService>(
  'Tree state related to widget',
);
