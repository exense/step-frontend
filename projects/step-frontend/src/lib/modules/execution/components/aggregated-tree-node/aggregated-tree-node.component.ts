import { Component, computed, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeNodeType } from '../../shared/aggregated-tree-node';
import { Status } from '../../../_common/shared/status.enum';

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

  protected isHideInlineInfo = computed(() => {
    const nodeId = this.nodeId();
    const visibleInfos = this._treeState.visibleInfos();
    return !!visibleInfos[nodeId];
  });

  protected toggleInfo(): void {
    const node = this.node();
    if (!node) {
      return;
    }
    this._treeState.toggleInfo(node);
  }

  protected showAggregatedDetails(status?: Status): void {
    const node = this.node();
    if (!node) {
      return;
    }
    this._treeState.showAggregatedDetails(node, status);
  }
}
