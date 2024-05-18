import { Component, computed, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AppliedStatusPipe } from '../../pipes/applied-status.pipe';

@Component({
  selector: 'step-aggregated-tree-status',
  templateUrl: './aggregated-tree-status.component.html',
  styleUrl: './aggregated-tree-status.component.scss',
  providers: [AppliedStatusPipe],
})
export class AggregatedTreeStatusComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  protected _appliedStatus = inject(AppliedStatusPipe);

  nodeId = input.required<string>();

  status = computed(() => {
    const node = this._treeState.findNodeById(this.nodeId());
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
