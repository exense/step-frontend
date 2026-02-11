import { Component, computed, inject, input, Signal } from '@angular/core';
import { Execution, STATUS_COLORS } from '@exense/step-core';
import { TreeNodePieChartSlice } from '../aggregated-tree-node-history/execution-piechart/aggregated-tree-node-statuses-piechart.component';
import { HistoryNodeItem } from '../aggregated-tree-node-history/history-nodes/history-nodes.component';

@Component({
  selector: 'step-history-cell',
  templateUrl: './execution-history-cell.component.html',
  styleUrl: './execution-history-cell.component.scss',
  standalone: false,
})
export class HistoryCellComponent {
  private _statusColors = inject(STATUS_COLORS);

  readonly execution = input.required<Execution>();

  protected readonly currentNode: Signal<HistoryNodeItem> = computed(() => {
    const execution = this.execution()!;
    const resultStatus = execution.status === 'RUNNING' ? 'RUNNING' : execution.result!;
    const color = this._statusColors[resultStatus];
    return {
      statusSlices: [
        {
          color: color,
          label: resultStatus,
          count: 1,
        },
      ],
    };
  });

  protected readonly historyNodes: Signal<HistoryNodeItem[]> = computed(() => {
    const execution = this.execution()!;
    return (execution?.historyResults || []).reverse().map((e) => {
      const color = this._statusColors[e.result];
      return {
        link: `/executions/${e.id!}`,
        tooltipLink: `/executions/${e.id!}`,
        tooltipLinkLabel: 'See execution',
        statusSlices: [
          {
            color: color,
            label: e.result,
            count: 1,
          },
        ],
      };
    });
  });

  protected readonly historyItems: Signal<TreeNodePieChartSlice[]> = computed(() => {
    let execution = this.execution();
    return (execution?.historyResults || []).map((i) => {
      const color = this._statusColors[i.result];
      return {
        color: color,
        label: i.result,
        count: 1,
      };
    });
  });
}
