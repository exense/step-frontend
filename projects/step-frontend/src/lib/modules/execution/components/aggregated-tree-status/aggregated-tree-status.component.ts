import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { Status } from '../../../_common/shared/status.enum';

export interface StatusItem {
  status: Status;
  className: string;
  count: number;
  tooltipMessage: string;
}

@Component({
  selector: 'step-aggregated-tree-status',
  templateUrl: './aggregated-tree-status.component.html',
  styleUrl: './aggregated-tree-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregatedTreeStatusComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);

  /**
   * @Input()
   * **/
  readonly nodeId = input<string>();

  /**
   * @Input()
   * **/
  readonly node = input<AggregatedTreeNode>();

  readonly statusClick = output<Status>();

  protected status = computed(() => {
    let node = this.node();
    const nodeId = this.nodeId();
    node = node ?? (nodeId ? this._treeState.findNodeById(nodeId) : undefined);
    return node?.countByStatus;
  });

  protected statusItems = computed(() => {
    const aggregatedStatus = this.status() ?? {};
    return Object.entries(aggregatedStatus)
      .map(([status, count]) => this.createStatusItem(status, count))
      .filter((item) => !!item) as StatusItem[];
  });

  private createStatusItem(status?: Status | string, count?: number): StatusItem | undefined {
    if (!status || !count) {
      return undefined;
    }
    const className = `step-node-aggregated-status-${status}`;
    const tooltipMessage = `${status}: ${count}`;
    return { className, count, status: status as Status, tooltipMessage };
  }
}
