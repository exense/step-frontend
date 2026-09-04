import { Component, computed, inject, input } from '@angular/core';
import { AggregatedTreeNodeStatusesPiechartComponent } from '../execution-piechart/aggregated-tree-node-statuses-piechart.component';
import { StatusDistributionTooltipComponent } from '../../status-distribution-tooltip/status-distribution-tooltip.component';
import { ElementSizeService, StepBasicsModule } from '@exense/step-core';
import { HistoryNodeItem } from './history-node-item';

const NODE_SLOT_SIZE_FACTOR = 1.25;
const CURRENT_NODE_GAP_FACTOR = 0.5;

@Component({
  selector: 'step-history-nodes',
  templateUrl: './history-nodes.component.html',
  styleUrl: './history-nodes.component.scss',
  standalone: true,
  imports: [StepBasicsModule, AggregatedTreeNodeStatusesPiechartComponent, StatusDistributionTooltipComponent],
})
export class HistoryNodesComponent {
  private readonly _parentElementSize = inject(ElementSizeService, { optional: true, skipSelf: true });

  readonly nodesCount = input.required<number>();
  readonly showTimestamps = input<boolean>();
  readonly showTooltip = input<boolean>(false);
  readonly pastNodes = input.required<HistoryNodeItem[]>();
  readonly currentNode = input.required<HistoryNodeItem>();
  readonly nodesSize = input<number>(20);

  protected readonly isFitToParent = computed(() => {
    const availableWidth = this._parentElementSize?.width() ?? 0;
    const nodesCount = this.nodesCount();
    const nodesSize = this.nodesSize();

    if (!availableWidth) {
      return true;
    }

    const normalizedNodesCount = Math.max(nodesCount, 1);
    const requiredWidth =
      normalizedNodesCount * nodesSize * NODE_SLOT_SIZE_FACTOR + nodesSize * CURRENT_NODE_GAP_FACTOR;
    return requiredWidth <= availableWidth;
  });

  protected readonly paddedPastExecutions = computed(() => {
    const pastNodes = this.pastNodes();
    const count = this.nodesCount();

    if (count <= 0) return [];

    if (pastNodes.length < count - 1) {
      return this.padArrayWithNull(pastNodes, count - 1); // one element is the current node
    }

    return pastNodes.slice(-(count - 1));
  });

  private padArrayWithNull(array: HistoryNodeItem[], size: number): (HistoryNodeItem | null)[] {
    const padCount = Math.max(0, size - (array?.length ?? 0));
    return Array(padCount).fill(null).concat(array);
  }
}
