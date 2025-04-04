import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  AugmentedExecutionsService,
  ExecutiontTaskParameters,
  ReportNode,
  ScheduledTaskTemporaryStorageService,
} from '@exense/step-core';
import { AltReportNodeDetailsStateService } from './alt-report-node-details-state.service';
import { from, map, Observable, of } from 'rxjs';
import { EXECUTION_ID } from './execution-id.token';
import { Status } from '../../_common/shared/status.enum';
import { SchedulerInvokerService } from './scheduler-invoker.service';
import { REPORT_NODE_DETAILS_QUERY_PARAMS } from './report-node-details-query-params.token';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { MatDialog } from '@angular/material/dialog';
import { AgentsModalComponent } from '../components/execution-agent-modal/execution-agent-modal.component';

export interface OpenIterationsParams {
  artefactId: string;
  artefactHash?: string;
  countByStatus?: Record<string, number>;
  nodeStatus?: Status;
  reportNodeId?: string;
  nodeStatusCount?: number;
}

export type PartialOpenIterationsParams = Pick<OpenIterationsParams, 'nodeStatus' | 'reportNodeId' | 'nodeStatusCount'>;

@Injectable()
export class AltExecutionDialogsService implements SchedulerInvokerService {
  private _executionsApi = inject(AugmentedExecutionsService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _reportNodeDetails = inject(AltReportNodeDetailsStateService);
  private _executionId = inject(EXECUTION_ID);
  private _queryParamsNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
  private _matDialog = inject(MatDialog);

  openIterations(params: OpenIterationsParams): void;
  openIterations(node: AggregatedTreeNode, restParams: PartialOpenIterationsParams): void;
  openIterations(
    nodeOrParams: AggregatedTreeNode | OpenIterationsParams,
    restParams?: PartialOpenIterationsParams,
  ): void {
    if (arguments.length === 2) {
      const node = nodeOrParams as AggregatedTreeNode;
      restParams = restParams ?? {};
      const { id: artefactId, artefactHash, countByStatus } = node;
      this.openIterations({ artefactId, artefactHash, countByStatus, ...restParams });
      return;
    }

    const { artefactId, artefactHash, countByStatus, reportNodeId, nodeStatus, nodeStatusCount } =
      nodeOrParams as OpenIterationsParams;
    if (!!reportNodeId) {
      this.navigateToIterationDetails(reportNodeId, artefactId);
      return;
    }
    const itemsCounts = Object.values(countByStatus ?? {});
    if (itemsCounts.length === 1 && itemsCounts[0] === 1 && artefactHash) {
      this.getSingleRunReportNode(artefactHash).subscribe((reportNode) => {
        this._reportNodeDetails.setReportNode(reportNode);
        this.navigateToIterationDetails(reportNode.id!, artefactId);
      });
      return;
    }
    this.navigateToIterationList(artefactId, nodeStatus, nodeStatusCount);
  }

  openIterationDetails<T extends ReportNode>(reportNode: T): void {
    this._reportNodeDetails.setReportNode(reportNode);
    this.navigateToIterationDetails(reportNode.id!);
  }

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], {
      relativeTo: this._activatedRoute,
    });
  }

  private navigateToIterationList(aggregatedNodeId: string, searchStatus?: Status, searchStatusCount?: number): void {
    const queryParams: Params = {};
    queryParams[this._queryParamsNames.aggregatedNodeId] = aggregatedNodeId;
    queryParams[this._queryParamsNames.searchStatus] = searchStatus;
    queryParams[this._queryParamsNames.searchStatusCount] = searchStatusCount;
    this.openNodeDetails(queryParams);
  }

  private navigateToIterationDetails(reportNodeId: string, aggregatedNodeId?: string): void {
    const queryParams: Params = {};
    queryParams[this._queryParamsNames.reportNodeId] = reportNodeId;
    queryParams[this._queryParamsNames.aggregatedNodeId] = aggregatedNodeId;
    this.openNodeDetails(queryParams);
  }

  private openNodeDetails(queryParams: Params): void {
    const isDetailsOpened = this._router.url.includes('node-details');
    const closePrevious$ = isDetailsOpened ? this.closeNodeDetails() : of(undefined);
    closePrevious$.subscribe(() => {
      this._router.navigate([{ outlets: { nodeDetails: ['node-details'] } }], {
        relativeTo: this._activatedRoute,
        queryParams,
        queryParamsHandling: 'merge',
      });
    });
  }

  private closeNodeDetails(): Observable<unknown> {
    const closePromise = this._router.navigate([{ outlets: { nodeDetails: null } }], {
      relativeTo: this._activatedRoute,
    });
    return from(closePromise);
  }

  private getSingleRunReportNode(artefactHash: string): Observable<ReportNode> {
    return this._executionsApi
      .getReportNodesByArtefactHash(this._executionId(), artefactHash)
      .pipe(map((response) => response[0]));
  }

  openAgentsModal(involvedAgents: string, description: string) {
    this._matDialog.open(AgentsModalComponent, {
      data: {
        agents: (involvedAgents ?? '').split(' ').filter((agent) => agent.trim() !== ''),
        description: description,
      },
    });
  }
}
