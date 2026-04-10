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
import { NODE_DETAILS_RELATIVE_PARENT } from './node-details-relative-parent.token';
import { AltExecutionNodesHelperService } from './alt-execution-nodes-helper.service';
import { DrilldownRootType } from '../shared/drilldown-root-type';

export interface OpenIterationsParams {
  aggregatedNodeId: string;
  countByStatus?: Record<string, number>;
  singleInstanceReportNode?: ReportNodeWithArtefact<AbstractArtefact>;
  nodeStatus?: Status;
  reportNodeId?: string;
  nodeStatusCount?: number;
  searchFor?: string;
  drilldownRootType?: DrilldownRootType;
}

export type PartialOpenIterationsParams = Pick<
  OpenIterationsParams,
  'nodeStatus' | 'reportNodeId' | 'nodeStatusCount' | 'searchFor' | 'drilldownRootType'
>;

export interface OpenIterationsEvent {
  node: AggregatedTreeNode;
  restParams: PartialOpenIterationsParams;
}

@Injectable()
export class AltExecutionDialogsService implements SchedulerInvokerService {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _reportNodeDetails = inject(AltReportNodeDetailsStateService, { optional: true });
  private _altExecutionNodesHelper = inject(AltExecutionNodesHelperService, { optional: true });
  private _queryParamsNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
  private _nodeDetailsRelativeParent = inject(NODE_DETAILS_RELATIVE_PARENT, { optional: true }) ?? this._activatedRoute;

  getSingleReportNode(
    node: AggregatedTreeNode | OpenIterationsParams,
  ): ReportNodeWithArtefact<AbstractArtefact> | undefined {
    const { countByStatus, singleInstanceReportNode } = node;
    const itemsCounts = Object.values(countByStatus ?? {});
    if (itemsCounts.length === 1 && itemsCounts[0] === 1) {
      return singleInstanceReportNode!;
    }
    return undefined;
  }

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

    const { aggregatedNodeId, reportNodeId, nodeStatus, nodeStatusCount, searchFor, drilldownRootType } =
      nodeOrParams as OpenIterationsParams;
    if (!!reportNodeId) {
      this.navigateToIterationDetails(reportNodeId, undefined, undefined, drilldownRootType);
      return;
    }
    const reportNode = this.getSingleReportNode(nodeOrParams);
    if (!!reportNode) {
      this._reportNodeDetails?.setReportNode?.(reportNode);
      this._altExecutionNodesHelper?.cacheReportNode?.(reportNode);
      this.navigateToIterationDetails(reportNode.id!, {}, searchFor, drilldownRootType);
      return;
    }
    this.navigateToIterationList(aggregatedNodeId, nodeStatus, nodeStatusCount, drilldownRootType);
  }

  openIterationDetails<T extends ReportNode>(reportNode: T, drilldownRootType?: DrilldownRootType): void {
    this._reportNodeDetails?.setReportNode?.(reportNode);
    this._altExecutionNodesHelper?.cacheReportNode?.(reportNode);
    this.navigateToIterationDetails(reportNode.id!, undefined, undefined, drilldownRootType);
  }

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], {
      relativeTo: this._activatedRoute,
    });
  }

  private navigateToIterationList(
    aggregatedNodeId: string,
    searchStatus?: Status,
    searchStatusCount?: number,
    drilldownRootType?: DrilldownRootType,
  ): void {
    const queryParams: Params = {};
    queryParams[this._queryParamsNames.searchStatus] = searchStatus;
    queryParams[this._queryParamsNames.searchStatusCount] = searchStatusCount;
    this.openNodeDetails(`agid_${aggregatedNodeId}`, queryParams, undefined, drilldownRootType);
  }

  private navigateToIterationDetails(
    reportNodeId: string,
    queryParams: Params = {},
    searchFor?: string,
    drilldownRootType?: DrilldownRootType,
  ): void {
    this.openNodeDetails(`rnid_${reportNodeId}`, queryParams, searchFor, drilldownRootType);
  }

  private openNodeDetails(
    detailsId: string,
    queryParams: Params,
    searchFor?: string,
    drilldownRootType?: DrilldownRootType,
  ): void {
    const mergedParams = { ...queryParams };
    if (searchFor) {
      mergedParams['searchFor'] = searchFor;
    }

    this._router.navigate([{ outlets: { nodeDetails: ['node-details', detailsId] } }], {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParams: mergedParams,
      queryParamsHandling: 'merge',
      state: {
        drilldownRootType,
      },
    });
  }
}
