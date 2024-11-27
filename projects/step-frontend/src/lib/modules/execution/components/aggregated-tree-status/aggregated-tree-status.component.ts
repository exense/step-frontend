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

  protected errorStatusGroup = computed(() =>
    this.createStatusItemGroup(this.status(), Status.TECHNICAL_ERROR, Status.FAILED, Status.INTERRUPTED),
  );
  protected successStatusGroup = computed(() =>
    this.createStatusItemGroup(this.status(), Status.PASSED, Status.SKIPPED),
  );
  protected runningStatusGroup = computed(() => this.createStatusItemGroup(this.status(), Status.RUNNING));

  private createStatusItemGroup(
    aggregatedStatus: Record<string, number> | undefined,
    ...statuses: Status[]
  ): StatusItem[] | undefined {
    if (!aggregatedStatus) {
      return undefined;
    }

    const result = statuses
      .map((status) => this.createStatusItem(status, aggregatedStatus[status]))
      .filter((item) => !!item);
    if (!result.length) {
      return undefined;
    }

    return result as StatusItem[];
  }

  private createStatusItem(status?: Status, count?: number): StatusItem | undefined {
    if (!status || !count) {
      return undefined;
    }
    const className = `step-node-aggregated-status-${status}`;
    const tooltipMessage = `${status}: ${count}`;
    return { className, count, status, tooltipMessage };
  }
}
