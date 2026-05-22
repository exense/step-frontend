import { inject, Injectable, OnDestroy } from '@angular/core';
import { AggregatedReportViewTreeStateContextService } from './aggregated-report-view-tree-state.service';
import { first, map, Observable, of, switchMap, tap } from 'rxjs';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { AugmentedControllerService, ReportNode } from '@exense/step-core';
import { AltExecutionStateService } from './alt-execution-state.service';
import { Status } from '../../_common/shared/status.enum';

@Injectable()
export class AltExecutionNodesHelperService implements OnDestroy {
  private _executionState = inject(AltExecutionStateService);
  private _treeState = inject(AggregatedReportViewTreeStateContextService).getState();
  private _controllerService = inject(AugmentedControllerService);

  private reportNodesCache = new Map<string, ReportNode>();

  ngOnDestroy(): void {
    this.cleanup();
  }

  getAggregatedNode(aggregatedNodeId?: string): Observable<AggregatedTreeNode | undefined> {
    if (!aggregatedNodeId) {
      return of(undefined);
    }
    return this._treeState.isInitialized$.pipe(
      first((isInitialized) => !!isInitialized),
      map(() => this._treeState.findNodeById(aggregatedNodeId)),
    );
  }

  getAggregatedNodeUpdatable(aggregatedNodeId?: string): Observable<AggregatedTreeNode | undefined> {
    return this._executionState.timeRange$.pipe(switchMap(() => this.getAggregatedNode(aggregatedNodeId)));
  }

  getReportNode<T extends ReportNode>(
    reportNodeId: string | undefined,
    ignoreCache: boolean = false,
  ): Observable<T | undefined> {
    if (!reportNodeId) {
      return of(undefined);
    }
    if (!ignoreCache && this.reportNodesCache.has(reportNodeId)) {
      return of((this.reportNodesCache.get(reportNodeId) as T) ?? undefined);
    }

    return this._controllerService.getReportNode(reportNodeId).pipe(
      map((node) => node as T),
      tap((node) => this.cacheReportNode(node)),
    );
  }

  getReportNodeUpdatable<T extends ReportNode>(reportNodeId: string | undefined): Observable<T | undefined> {
    return this._executionState.timeRange$.pipe(
      switchMap((range) => {
        const isManualChange = !!range?.isManualChange;
        const nodeInCache = !reportNodeId ? undefined : this.reportNodesCache.get(reportNodeId);
        const isNotRunning = nodeInCache?.status !== Status.RUNNING;
        const useCacheValue = !isManualChange && !!nodeInCache && isNotRunning;
        return this.getReportNode<T>(reportNodeId, useCacheValue);
      }),
    );
  }

  cacheReportNode<T extends ReportNode>(reportNode: T): this {
    const id = reportNode.id!;
    this.reportNodesCache.set(id, reportNode);
    return this;
  }

  cleanup(): void {
    this.reportNodesCache.clear();
  }
}
