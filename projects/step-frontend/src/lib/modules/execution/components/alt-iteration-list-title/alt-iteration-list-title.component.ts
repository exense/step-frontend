import { Component, computed, inject, input } from '@angular/core';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { AggregatedReportViewTreeStateContextService } from '../../services/aggregated-report-view-tree-state.service';

@Component({
  selector: 'step-alt-iteration-list-title',
  templateUrl: './alt-iteration-list-title.component.html',
  styleUrl: './alt-iteration-list-title.component.scss',
  standalone: false,
})
export class AltIterationListTitleComponent {
  private readonly _treeStateContext = inject(AggregatedReportViewTreeStateContextService);

  readonly node = input<AggregatedTreeNode | undefined>();

  protected readonly displayNode = computed(() => {
    const node = this.node();
    if (!node) {
      return undefined;
    }

    const treeState = this._treeStateContext.getState();
    const currentNode = treeState.findNodeById(node.id) as AggregatedTreeNode | undefined;
    if (currentNode) {
      return currentNode;
    }

    if (treeState.isInitialized()) {
      return {
        ...node,
        countByStatus: {},
        hasDescendantInvocations: false,
      };
    }

    return node;
  });
}
