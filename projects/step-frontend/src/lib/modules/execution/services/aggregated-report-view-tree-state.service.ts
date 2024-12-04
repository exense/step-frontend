import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AggregatedReportView,
  AugmentedExecutionsService,
  DateRange,
  ReportNode,
  TreeStateService,
} from '@exense/step-core';
import { map, Observable } from 'rxjs';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { Status } from '../../_common/shared/status.enum';

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {
  private _executionsApi = inject(AugmentedExecutionsService);

  loadTree(executionId: string, dateRange?: DateRange): Observable<boolean> {
    return this.requestTree(executionId, dateRange).pipe(
      map((root) => {
        if (!root) {
          return false;
        }
        this.init(root, { expandAllByDefault: false });
        return true;
      }),
    );
  }

  private displayedAggregatedDetailsNodeIdInternal = signal<string | undefined>(undefined);

  readonly displayedAggregatedDetailsNode = computed(() => {
    const selectedNode = this.selectedNode();
    const displayAggregatedNodeId = this.displayedAggregatedDetailsNodeIdInternal();
    if (selectedNode && selectedNode.id === displayAggregatedNodeId) {
      return selectedNode;
    }
    return undefined;
  });

  private predefinedAggregatedDetailsNodeStatusInternal = signal<Status | undefined>(undefined);
  readonly predefinedAggregatedDetailsNodeStatus = this.predefinedAggregatedDetailsNodeStatusInternal.asReadonly();

  private visibleDetailsInternal = signal<Record<string, boolean>>({});
  readonly visibleDetails = this.visibleDetailsInternal.asReadonly();

  private visibleInfosInternal = signal<Record<string, boolean>>({});
  readonly visibleInfos = this.visibleInfosInternal.asReadonly();

  toggleDetail(node: ReportNode): void {
    const isVisible = !!this.visibleDetailsInternal()[node.id!];
    this.visibleDetailsInternal.update((value) => ({
      ...value,
      [node.id!]: !isVisible,
    }));
  }

  toggleInfo(node: AggregatedTreeNode): void {
    const isVisible = !!this.visibleInfosInternal()[node.id!];
    this.visibleInfosInternal.update((value) => ({
      ...value,
      [node.id!]: !isVisible,
    }));
  }

  showAggregatedDetails(nodeOrId: string | AggregatedTreeNode, status?: Status): void {
    this.selectNode(nodeOrId);
    const nodeId = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;
    this.displayedAggregatedDetailsNodeIdInternal.set(nodeId);
    this.predefinedAggregatedDetailsNodeStatusInternal.set(status);
  }

  private requestTree(executionId: string, dateRange?: DateRange): Observable<AggregatedReportView> {
    if (!dateRange) {
      return this._executionsApi.getFullAggregatedReportView(executionId);
    }
    return this._executionsApi.getAggregatedReportView(executionId, {
      range: {
        from: dateRange.start?.toMillis(),
        to: dateRange.end?.toMillis(),
      },
    });
  }
}
