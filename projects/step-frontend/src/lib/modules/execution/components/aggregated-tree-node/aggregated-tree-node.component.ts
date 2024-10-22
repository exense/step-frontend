import { Component, computed, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeNode, AggregatedTreeNodeType } from '../../shared/aggregated-tree-node';

@Component({
  selector: 'step-aggregated-tree-node',
  templateUrl: './aggregated-tree-node.component.html',
  styleUrl: './aggregated-tree-node.component.scss',
})
export class AggregatedTreeNodeComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);

  readonly AggregateTreeNodeType = AggregatedTreeNodeType;

  readonly nodeId = input.required<string>();

  protected node = computed(() => {
    const node = this._treeState.findNodeById(this.nodeId());
    return node;
  });

  protected toggleInfo(): void {
    const node = this.node();
    if (!node) {
      return;
    }
    this._treeState.toggleInfo(node);
  }

  protected showAggregatedDetails(): void {
    const node = this.node();
    if (!node) {
      return;
    }
    this._treeState.showAggregatedDetails(node);
  }
}
