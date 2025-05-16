import { computed, Directive, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../services/aggregated-report-view-tree-state.service';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';
import { Status } from '../../_common/shared/status.enum';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';

@Directive({
  selector: '[stepTreeNodeVisualState]',
  host: {
    '[class.not-significant]': `!hasStatuses() || isSkipped() || anotherClass()`,
  },
})
export class TreeNodeVisualStateDirective {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _reportNodeState = inject(AltReportNodesFilterService, { optional: true });

  readonly nodeId = input.required<string>({ alias: 'stepTreeNodeVisualState' });

  private node = computed(() => this._treeState.findNodeById(this.nodeId()));
  private statusFilter = computed(() => this._reportNodeState?.statusCtrlValue?.() ?? []);

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

  protected anotherClass = computed(() => {
    const node = this.node();
    const artefactClassValue = this._reportNodeState?.artefactClassValue?.();
    if (artefactClassValue === undefined || artefactClassValue.size === 0) {
      return false;
    }
    return !artefactClassValue.has(node?.originalArtefact?._class ?? '');
  });
}
