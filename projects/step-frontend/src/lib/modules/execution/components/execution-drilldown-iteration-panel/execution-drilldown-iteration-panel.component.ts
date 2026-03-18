import { Component, computed, inject, input } from '@angular/core';
import { ReportNode } from '@exense/step-core';
import { AggregatedReportViewTreeStateContextService } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { ExecutionDrilldownLeafPanel } from '../../services/execution-drilldown-state.service';

@Component({
  selector: 'step-execution-drilldown-iteration-panel',
  templateUrl: './execution-drilldown-iteration-panel.component.html',
  standalone: false,
})
export class ExecutionDrilldownIterationPanelComponent {
  private readonly _treeState = inject(AggregatedReportViewTreeStateContextService).getState();
  private readonly _dialogsService = inject(AltExecutionDialogsService);

  readonly panel = input.required<ExecutionDrilldownLeafPanel>();

  protected readonly aggregatedNode = computed(() => {
    const aggregatedNodeId = this.panel().aggregatedNodeId;
    return aggregatedNodeId ? this._treeState.findNodeById(aggregatedNodeId) : undefined;
  });

  protected handleOpenDetails(node: ReportNode): void {
    this._dialogsService.openIterationDetails(node);
  }
}
