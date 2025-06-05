import { computed, Directive, inject, input } from '@angular/core';
import { AggregatedReportViewTreeStateService } from '../services/aggregated-report-view-tree-state.service';
import { Status } from '../../_common/shared/status.enum';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';

@Directive({
  selector: '[stepTreeNodeVisualState]',
  host: {
    '[class.not-significant]': `notSignificantByStatus() || isSkipped() || anotherClass()`,
  },
  standalone: false,
})
export class TreeNodeVisualStateDirective {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _reportNodeState = inject(AltReportNodesFilterService, { optional: true });

  readonly nodeId = input.required<string>({ alias: 'stepTreeNodeVisualState' });

  private node = computed(() => this._treeState.findNodeById(this.nodeId()));
  private statusFilter = computed(() => this._reportNodeState?.statusCtrlValue?.() ?? []);

  private allStatuses = computed(() => {
    const node = this.node();
    if (!node?.countByStatus) {
      return [] as Status[];
    }
    return Object.keys(node.countByStatus) as Status[];
  });

  private filteredStatuses = computed(() => {
    const allStatuses = this.allStatuses();
    const statusFilter = this.statusFilter();

    let result = allStatuses;
    if (statusFilter?.length) {
      result = result.filter((status) => statusFilter.includes(status));
    }
    return new Set(result);
  });

  private hasDescendantInvocations = computed(() => !!this.node()?.hasDescendantInvocations);

  protected notSignificantByStatus = computed(() => {
    const hasDescendants = this.hasDescendantInvocations();
    const filteredStatuses = this.filteredStatuses();

    return filteredStatuses.size === 0 && !hasDescendants;
  });

  protected isSkipped = computed(() => {
    const statuses = this.filteredStatuses();
    if (!statuses.size) {
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
