import { Component, computed, forwardRef, inject, input, signal, TemplateRef } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeNodeType } from '../../shared/aggregated-tree-node';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { Status } from '../../../_common/shared/status.enum';
import { IsEmptyStatusPipe } from '../../pipes/is-empty-status.pipe';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';
import { ElementSizeService, TreeNodeData } from '@exense/step-core';

@Component({
  selector: 'step-aggregated-tree-node',
  templateUrl: './aggregated-tree-node.component.html',
  styleUrl: './aggregated-tree-node.component.scss',
  host: {
    '[class.highlight]': 'isInSearchResult()',
  },
  providers: [
    {
      provide: ElementSizeService,
      useExisting: forwardRef(() => AggregatedTreeNodeComponent),
    },
  ],
})
export class AggregatedTreeNodeComponent implements ElementSizeService {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _executionDialogs = inject(AltExecutionDialogsService);
  private _reportNodesFilter = inject(AltReportNodesFilterService, { optional: true });
  private _parentElementSize = inject(ElementSizeService, { skipSelf: true, optional: true });
  private _treeNodeData = inject(TreeNodeData);

  readonly AggregateTreeNodeType = AggregatedTreeNodeType;

  readonly nodeId = input.required<string>();
  readonly addonTemplate = input<TemplateRef<unknown> | undefined>(undefined);

  readonly height = signal(0);

  readonly width = computed(() => {
    const parentWidth = this._parentElementSize?.width?.() ?? 0;
    const levelOffset = this._treeNodeData.levelOffset();
    let result = !parentWidth ? 0 : parentWidth - levelOffset - 150;
    result = Math.max(result, 150);
    return result;
  });

  protected node = computed(() => {
    const node = this._treeState.findNodeById(this.nodeId());
    return node;
  });

  protected isSelected = computed(() => {
    const nodeId = this.nodeId();
    const selectedNodes = this._treeState.selectedNodeIds();
    return selectedNodes.includes(nodeId);
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

  protected showDetails(status?: Status, count?: number, event?: MouseEvent): void {
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
    const node = this.node();
    if (!node || IsEmptyStatusPipe.transform(node)) {
      return;
    }
    if (!count) {
      count = Object.values(node.countByStatus ?? {}).reduce((res, item) => res + item, 0);
    }
    this._treeState.selectNode(node);
    this._executionDialogs.openIterations(node, { nodeStatus: status, nodeStatusCount: count });
  }
}
