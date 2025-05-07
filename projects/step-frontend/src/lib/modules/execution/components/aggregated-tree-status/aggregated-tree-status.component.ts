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

  readonly nodeId = input<string>();
  readonly node = input<AggregatedTreeNode>();
  readonly statusFilter = input<Status[]>([]);

  readonly statusClick = output<{ status: Status; count: number; event: MouseEvent }>();

  protected status = computed(() => {
    let node = this.node();
    const nodeId = this.nodeId();
    node = node ?? (nodeId ? this._treeState.findNodeById(nodeId) : undefined);
    return node?.countByStatus;
  });

  protected statusItems = computed(() => {
    const aggregatedStatus = this.status() ?? {};
    const statusFilter = this.statusFilter();
    let result = Object.entries(aggregatedStatus)
      .map(([status, count]) => this.createStatusItem(status, count))
      .filter((item) => !!item) as StatusItem[];
    if (statusFilter?.length) {
      result = result.filter((item) => statusFilter.includes(item.status));
    }
    return result;
  });

  protected singleStatus = computed(() => {
    const items = this.statusItems();
    if (items.length === 1 && items[0].count === 1) {
      return items[0];
    }
    return undefined;
  });

  protected isEmptyStatus = computed(() => {
    const items = this.statusItems();
    const statusFilter = this.statusFilter();
    return !items.length && !statusFilter.length;
  });

  protected handleClick({ status, count }: StatusItem, event: MouseEvent): void {
    this.statusClick.emit({ status, count, event });
  }

  private createStatusItem(status?: Status | string, count?: number): StatusItem | undefined {
    if (!status || !count) {
      return undefined;
    }
    const className = `step-node-aggregated-status-${status}`;
    const tooltipMessage = `${status}: ${count}`;
    return { className, count, status: status as Status, tooltipMessage };
  }
}
