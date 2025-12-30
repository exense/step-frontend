import { Component, computed, inject, input, Signal } from '@angular/core';
import { Execution, STATUS_COLORS } from '@exense/step-core';
import { TreeNodePieChartSlice } from '../aggregated-tree-node-history/execution-piechart/aggregated-tree-node-statuses-piechart.component';

@Component({
  selector: 'step-history-cell',
  templateUrl: './execution-history-cell.component.html',
  styleUrl: './execution-history-cell.component.scss',
  standalone: false,
})
export class HistoryCellComponent {
  private _statusColors = inject(STATUS_COLORS);

  execution = input.required<Execution>();

  historyItems: Signal<TreeNodePieChartSlice[]> = computed(() => {
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
