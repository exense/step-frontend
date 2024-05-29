import { Component, computed, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AppliedStatusPipe } from '../../pipes/applied-status.pipe';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';

@Component({
  selector: 'step-aggregated-tree-status',
  templateUrl: './aggregated-tree-status.component.html',
  styleUrl: './aggregated-tree-status.component.scss',
  providers: [AppliedStatusPipe],
})
export class AggregatedTreeStatusComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  protected _appliedStatus = inject(AppliedStatusPipe);

  nodeId = input<string>();
  node = input<AggregatedTreeNode>();

  status = computed(() => {
    let node = this.node();
    const nodeId = this.nodeId();
    node = node ?? (nodeId ? this._treeState.findNodeById(nodeId) : undefined);
    return node?.countByStatus;
  });

  total = computed(() => {
    const status = this.status() ?? {};
    return Object.values(status).reduce((res, value) => res + value, 0);
  });

  appliedStatus = computed(() => this._appliedStatus.transform(this.status()));

  statusClassName = computed(() => {
    const status = this.appliedStatus();
    return `step-node-aggregated-status-${status}`;
  });
}
