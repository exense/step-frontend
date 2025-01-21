import { Component, computed, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';

@Component({
  selector: 'step-aggregated-tree-node-info',
  templateUrl: './aggregated-tree-node-info.component.html',
  styleUrl: './aggregated-tree-node-info.component.scss',
})
export class AggregatedTreeNodeInfoComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);

  readonly nodeId = input.required<string>();

  protected isVisible = computed(() => {
    const nodeId = this.nodeId();
    const visibleInfos = this._treeState.visibleInfos();
    return !!visibleInfos[nodeId];
  });

  protected node = computed(() => {
    const node = this._treeState.findNodeById(this.nodeId());
    return node;
  });
}
