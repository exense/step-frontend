import { Component, computed, inject, input, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Execution, STATUS_COLORS, StepBasicsModule } from '@exense/step-core';
import { StatusDistributionTooltipComponent } from '../status-distribution-tooltip/status-distribution-tooltip.component';
import { HistoryNodeItem } from '../aggregated-tree-node-history/history-nodes/history-node-item';
import { Status } from '../../../_common/shared/status.enum';

export interface ExecutionNode {
  id: string;
  startTime: number;
  status: string;
  color: string;
}

@Component({
  selector: 'step-execution-history-nodes',
  templateUrl: './execution-history-nodes.component.html',
  styleUrl: './execution-history-nodes.component.scss',
  standalone: false,
})
export class ExecutionHistoryNodesComponent {
  private _statusColors = inject(STATUS_COLORS);

  readonly nodesCount = input.required<number>();
  readonly execution = input.required<Execution>();
  readonly nodesSize = input<number>(10);
  readonly currentNodeSize = input<number>(16);

  private _router = inject(Router);

  protected readonly pastNodes: Signal<ExecutionNode[]> = computed(() => {
    return this.execution().historyResults?.map((item) => {
      const color = this._statusColors[item.result];
      return { id: item.id, status: item.result, color: color, startTime: item.startTime };
    });
  });

  protected readonly currentNode: Signal<ExecutionNode> = computed(() => {
    const execution = this.execution();
    const resultStatus = execution.status === 'RUNNING' ? 'RUNNING' : execution.result!;
    const color = this._statusColors[resultStatus];
    return {
      id: execution.id!,
      status: resultStatus,
      color: color,
      startTime: execution.startTime!
    };
  });

  protected readonly paddedPastExecutions: Signal<(ExecutionNode | null)[]> = computed(() => {
    const pastNodes = this.pastNodes().reverse();
    const count = this.nodesCount();

    if (count <= 0) return [];

    if (pastNodes.length < count - 1) {
      return this.padArrayWithNull(pastNodes, count - 1); // one element is the current node
    }

    return pastNodes.slice(-(count - 1));
  });

  private padArrayWithNull(array: ExecutionNode[], size: number): (ExecutionNode | null)[] {
    const padCount = Math.max(0, size - (array?.length ?? 0));
    return Array(padCount).fill(null).concat(array);
  }
}
