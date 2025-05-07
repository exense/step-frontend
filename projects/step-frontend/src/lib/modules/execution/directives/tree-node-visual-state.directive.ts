import { computed, Directive, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../services/aggregated-report-view-tree-state.service';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';
import { Status } from '../../_common/shared/status.enum';
import { ReportNodeType } from '../../report-nodes/shared/report-node-type.enum';

@Directive({
  selector: '[stepTreeNodeVisualState]',
  host: {
    '[class.not-significant]': `!hasStatuses() || isSkipped() || anotherType()`,
  },
})
export class TreeNodeVisualStateDirective {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _reportNodeState = inject(AltReportNodesStateService, { optional: true });

  readonly nodeId = input.required<string>({ alias: 'stepTreeNodeVisualState' });

  private node = computed(() => this._treeState.findNodeById(this.nodeId()));
  private statusFilter = computed(() => this._reportNodeState?.statusCtrlValue?.() ?? []);
  private isKeywordFilter = computed(
    () => this._reportNodeState?.reportNodeClassValue?.() === ReportNodeType.CALL_FUNCTION_REPORT_NODE,
  );

  private nodeStatuses = computed(() => {
    const node = this.node();
    const statusFilter = this.statusFilter();
    if (!node?.countByStatus) {
      return undefined;
    }
    let result = Object.keys(node.countByStatus) as Status[];
    if (statusFilter?.length) {
      result = result.filter((status) => statusFilter.includes(status));
    }
    return new Set(result);
  });

  protected hasStatuses = computed(() => !!this.nodeStatuses()?.size);

  protected isSkipped = computed(() => {
    const statuses = this.nodeStatuses();
    if (!statuses) {
      return false;
    }
    return statuses.size === 1 && statuses.has(Status.SKIPPED);
  });

  protected anotherType = computed(() => {
    const node = this.node();
    const isKeywordFilter = this.isKeywordFilter();
    return isKeywordFilter && node?.originalArtefact?._class !== 'CallKeyword';
  });
}
