import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  AbstractArtefact,
  ExecutiontTaskParameters,
  ReportNode,
  ReportNodeWithArtefact,
  ScheduledTaskTemporaryStorageService,
} from '@exense/step-core';
import { AltReportNodeDetailsStateService } from './alt-report-node-details-state.service';
import { Status } from '../../_common/shared/status.enum';
import { SchedulerInvokerService } from './scheduler-invoker.service';
import { REPORT_NODE_DETAILS_QUERY_PARAMS } from './report-node-details-query-params.token';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { MatDialog } from '@angular/material/dialog';
import { AgentsModalComponent } from '../components/execution-agent-modal/execution-agent-modal.component';
import { NODE_DETAILS_RELATIVE_PARENT } from './node-details-relative-parent.token';

export interface OpenIterationsParams {
  aggregatedNodeId: string;
  countByStatus?: Record<string, number>;
  singleInstanceReportNode?: ReportNodeWithArtefact<AbstractArtefact>;
  nodeStatus?: Status;
  reportNodeId?: string;
  nodeStatusCount?: number;
}

export type PartialOpenIterationsParams = Pick<OpenIterationsParams, 'nodeStatus' | 'reportNodeId' | 'nodeStatusCount'>;

@Injectable()
export class AltExecutionDialogsService implements SchedulerInvokerService {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _reportNodeDetails = inject(AltReportNodeDetailsStateService, { optional: true });
  private _queryParamsNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
  private _matDialog = inject(MatDialog);
  private _nodeDetailsRelativeParent = inject(NODE_DETAILS_RELATIVE_PARENT, { optional: true }) ?? this._activatedRoute;

  openIterations(params: OpenIterationsParams): void;
  openIterations(node: AggregatedTreeNode, restParams: PartialOpenIterationsParams): void;
  openIterations(
    nodeOrParams: AggregatedTreeNode | OpenIterationsParams,
    restParams?: PartialOpenIterationsParams,
  ): void {
    if (arguments.length === 2) {
      const node = nodeOrParams as AggregatedTreeNode;
      restParams = restParams ?? {};
      const { id: aggregatedNodeId, countByStatus, singleInstanceReportNode } = node;
      this.openIterations({ aggregatedNodeId, countByStatus, singleInstanceReportNode, ...restParams });
      return;
    }

    const { aggregatedNodeId, countByStatus, reportNodeId, nodeStatus, nodeStatusCount, singleInstanceReportNode } =
      nodeOrParams as OpenIterationsParams;
    if (!!reportNodeId) {
      this.navigateToIterationDetails(reportNodeId);
      return;
    }
    const itemsCounts = Object.values(countByStatus ?? {});
    if (itemsCounts.length === 1 && itemsCounts[0] === 1) {
      const reportNode = singleInstanceReportNode!;
      this._reportNodeDetails?.setReportNode?.(reportNode);
      this.navigateToIterationDetails(reportNode.id!);
      return;
    }
    this.navigateToIterationList(aggregatedNodeId, nodeStatus, nodeStatusCount);
  }

  openIterationDetails<T extends ReportNode>(reportNode: T): void {
    this._reportNodeDetails?.setReportNode?.(reportNode);
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
    queryParams[this._queryParamsNames.searchStatus] = searchStatus;
    queryParams[this._queryParamsNames.searchStatusCount] = searchStatusCount;
    this.openNodeDetails(`agid_${aggregatedNodeId}`, queryParams);
  }

  private navigateToIterationDetails(reportNodeId: string): void {
    this.openNodeDetails(`rnid_${reportNodeId}`, {});
  }

  private openNodeDetails(detailsId: string, queryParams: Params): void {
    this._router.navigate([{ outlets: { nodeDetails: ['node-details', detailsId] } }], {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParams,
      queryParamsHandling: 'merge',
    });
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
