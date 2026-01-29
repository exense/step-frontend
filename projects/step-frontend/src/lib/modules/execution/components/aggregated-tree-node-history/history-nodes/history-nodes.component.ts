import { Component, computed, effect, input, signal } from '@angular/core';
import {
  AggregatedTreeNodeStatusesPiechartComponent,
  TreeNodePieChartSlice,
} from '../execution-piechart/aggregated-tree-node-statuses-piechart.component';
import { StatusDistributionTooltipComponent } from '../../status-distribution-tooltip/status-distribution-tooltip.component';
import { StepBasicsModule } from '@exense/step-core';

export interface HistoryNodeItem {
  statusSlices: TreeNodePieChartSlice[];
  timestamp?: number;
  tooltipLinkLabel?: string;
  tooltipLink?: string;
}

// interface HistoryNodeItemInternal extends HistoryNodeItem{
//   statusesCount?: Record<string, number>;
// }

@Component({
  selector: 'step-history-nodes',
  templateUrl: './history-nodes.component.html',
  styleUrl: './history-nodes.component.scss',
  standalone: true,
  imports: [StepBasicsModule, AggregatedTreeNodeStatusesPiechartComponent, StatusDistributionTooltipComponent],
})
export class HistoryNodesComponent {
  nodesCount = input.required<number>();
  showTimestamps = input<boolean>();
  showTooltip = input<boolean>(false);
  pastNodes = input.required<HistoryNodeItem[]>();
  currentNode = input.required<HistoryNodeItem>();
  nodesSize = input<number>(20);

  paddedPastExecutions = computed(() => {
    const pastNodes = this.pastNodes();
    const count = this.nodesCount();

    if (count <= 0) return [];

    if (pastNodes.length < count) {
      return this.padArrayWithNull(pastNodes, count - 1); // one element is the current node
    }

    return pastNodes.slice(-(count - 1));
  });

  logEffect = effect(() => {
    console.log(this.pastNodes());
    console.log(this.paddedPastExecutions());
  });

  private padArrayWithNull(array: HistoryNodeItem[], size: number): HistoryNodeItem[] {
    const padCount = Math.max(0, size - (array?.length ?? 0));
    return Array(padCount).fill(null).concat(array);
  }
}
