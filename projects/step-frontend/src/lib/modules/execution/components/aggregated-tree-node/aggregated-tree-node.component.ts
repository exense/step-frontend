import { Component, computed, forwardRef, inject, input, output, TemplateRef } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeNodeType } from '../../shared/aggregated-tree-node';
import { OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';
import { Status } from '../../../_common/shared/status.enum';
import { IsEmptyStatusPipe } from '../../pipes/is-empty-status.pipe';
import { ArtefactService, ElementSizeService, TreeNodeData } from '@exense/step-core';
import { AGGREGATED_TREE_NODE_LARGE_VIEW } from '../../services/aggregated-tree-node-large-view.token';
import { hasAltExecutionReportDetail } from '../../shared/alt-execution-report-details';
import { OPEN_EXECUTION_DETAILS_TOOLTIP } from '../../shared/open-execution-details-tooltip';

@Component({
  selector: 'step-aggregated-tree-node',
  templateUrl: './aggregated-tree-node.component.html',
  styleUrl: './aggregated-tree-node.component.scss',
  providers: [
    {
      provide: ElementSizeService,
      useExisting: forwardRef(() => AggregatedTreeNodeComponent),
    },
  ],
  standalone: false,
})
export class AggregatedTreeNodeComponent implements ElementSizeService {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _parentElementSize = inject(ElementSizeService, { skipSelf: true, optional: true });
  private _treeNodeData = inject(TreeNodeData);
  private _artefactTypes = inject(ArtefactService);
  protected readonly _useLargeView = inject(AGGREGATED_TREE_NODE_LARGE_VIEW);

  readonly AggregateTreeNodeType = AggregatedTreeNodeType;
  readonly openIterations = output<OpenIterationsEvent>();

  readonly nodeId = input.required<string>();
  readonly addonTemplate = input<TemplateRef<unknown> | undefined>(undefined);
  readonly details = input<readonly string[] | undefined>(undefined);

  readonly height = computed(() => this._parentElementSize?.height?.() ?? 0);

  readonly width = computed(() => {
    const parentWidth = this._parentElementSize?.width?.() ?? 0;
    const levelOffset = this._treeNodeData.levelOffset();
    let result = !parentWidth ? 0 : parentWidth - levelOffset - 200;
    result = Math.max(result, 200);
    return result;
  });

  protected readonly node = computed(() => {
    const node = this._treeState.findNodeById(this.nodeId());
    return node;
  });

  protected readonly iconClass = computed(() => {
    const node = this.node();
    return ['control-icon', node?.iconClassName].filter((cssClass) => !!cssClass).join(' ');
  });

  protected readonly iconTooltip = computed(() => {
    const artefactClass = this.node()?.originalArtefact?._class;
    return this._artefactTypes.getArtefactType(artefactClass)?.label ?? artefactClass ?? '';
  });

  protected readonly isSelected = computed(() => {
    const nodeId = this.nodeId();
    const selectedNodes = this._treeState.selectedNodeIds();
    return selectedNodes.includes(nodeId);
  });

  protected readonly showFullDescription = computed(() =>
    hasAltExecutionReportDetail(this.details(), 'fullDescription'),
  );

  protected readonly detailsTooltip = OPEN_EXECUTION_DETAILS_TOOLTIP;

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
    this.openIterations.emit({ node, restParams: { nodeStatus: status, nodeStatusCount: count } });
  }
}
