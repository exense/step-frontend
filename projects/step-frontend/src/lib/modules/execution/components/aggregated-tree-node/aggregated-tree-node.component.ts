import { Component, computed, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeNodeType } from '../../shared/aggregated-tree-node';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { Status } from '../../../_common/shared/status.enum';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { ReportNodeType } from '../../../report-nodes/shared/report-node-type.enum';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';

@Component({
  selector: 'step-aggregated-tree-node',
  templateUrl: './aggregated-tree-node.component.html',
  styleUrl: './aggregated-tree-node.component.scss',
  host: {
    '[class.highlight]': 'isInSearchResult()',
  },
})
export class AggregatedTreeNodeComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _executionDialogs = inject(AltExecutionDialogsService);
  private _reportNodesFilter = inject(AltReportNodesFilterService, { optional: true });

  readonly AggregateTreeNodeType = AggregatedTreeNodeType;

  readonly nodeId = input.required<string>();

  protected node = computed(() => {
    const node = this._treeState.findNodeById(this.nodeId());
    return node;
  });

  protected isInSearchResult = computed(() => {
    const nodeId = this.nodeId();
    const selectedSearchResult = this._treeState.selectedSearchResult();
    return selectedSearchResult === nodeId;
  });

  protected showStatus = computed(() => {
    const node = this.node();
    const artefactClass = this._reportNodesFilter?.artefactClassValue?.();
    if (!artefactClass?.size) {
      return true;
    }
    return artefactClass.has(node?.originalArtefact?._class ?? '');
  });

  protected statusFilter = computed(() => this._reportNodesFilter?.statusCtrlValue?.() ?? []);

  protected readonly detailsTooltip = 'Open execution details';

  protected showIterations(status?: Status, count?: number, event?: MouseEvent): void {
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
    const node = this.node();
    if (!node) {
      return;
    }
    if (!count) {
      count = Object.values(node.countByStatus ?? {}).reduce((res, item) => res + item, 0);
    }
    this._treeState.selectNode(node);
    this._executionDialogs.openIterations(node, { nodeStatus: status, nodeStatusCount: count });
  }
}
