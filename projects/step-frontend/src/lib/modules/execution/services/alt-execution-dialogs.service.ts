import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { AltExecutionNodesHelperService } from './alt-execution-nodes-helper.service';
import { DrilldownRootType } from '../shared/drilldown-root-type';
import { AltExecutionDrilldownNavigationUtilsService } from './alt-execution-drilldown-navigation-utils.service';

export interface OpenIterationsParams {
  aggregatedNodeId: string;
  countByStatus?: Record<string, number>;
  singleInstanceReportNode?: ReportNodeWithArtefact<AbstractArtefact>;
  nodeStatus?: Status;
  reportNodeId?: string;
  nodeStatusCount?: number;
  searchFor?: string;
}

export type PartialOpenIterationsParams = Pick<
  OpenIterationsParams,
  'nodeStatus' | 'reportNodeId' | 'nodeStatusCount' | 'searchFor'
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
  private _drilldownNavigationUtils = inject(AltExecutionDrilldownNavigationUtilsService);

  openIterations(drilldownRootType: DrilldownRootType, params: OpenIterationsParams): void;
  openIterations(
    drilldownRootType: DrilldownRootType,
    node: AggregatedTreeNode,
    restParams: PartialOpenIterationsParams,
  ): void;
  openIterations(
    drilldownRootType: DrilldownRootType,
    nodeOrParams: AggregatedTreeNode | OpenIterationsParams,
    restParams?: PartialOpenIterationsParams,
  ): void {
    if (arguments.length === 2) {
      const node = nodeOrParams as AggregatedTreeNode;
      restParams = restParams ?? {};
      const { id: aggregatedNodeId, countByStatus, singleInstanceReportNode } = node;
      this.openIterations(drilldownRootType, {
        aggregatedNodeId,
        countByStatus,
        singleInstanceReportNode,
        ...restParams,
      });
      return;
    }

    const { aggregatedNodeId, reportNodeId, nodeStatus, nodeStatusCount, searchFor } =
      nodeOrParams as OpenIterationsParams;
    if (!!reportNodeId) {
      this.navigateToIterationDetails(drilldownRootType, reportNodeId, undefined);
      return;
    }
    const reportNode = this._drilldownNavigationUtils.getSingleReportNode(nodeOrParams);
    if (!!reportNode) {
      this._reportNodeDetails?.setReportNode?.(reportNode);
      this._altExecutionNodesHelper?.cacheReportNode?.(reportNode);
      this.navigateToIterationDetails(drilldownRootType, reportNode.id!, searchFor);
      return;
    }
    this.navigateToIterationList(drilldownRootType, aggregatedNodeId, nodeStatus, nodeStatusCount);
  }

  openIterationDetails<T extends ReportNode>(drilldownRootType: DrilldownRootType, reportNode: T): void {
    this._reportNodeDetails?.setReportNode?.(reportNode);
    this._altExecutionNodesHelper?.cacheReportNode?.(reportNode);
    this.navigateToIterationDetails(drilldownRootType, reportNode.id!);
  }

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], {
      relativeTo: this._activatedRoute,
    });
  }

  private navigateToIterationList(
    drilldownRootType: DrilldownRootType,
    aggregatedNodeId: string,
    searchStatus?: Status,
    searchStatusCount?: number,
  ): void {
    this._drilldownNavigationUtils.openDrilldown(drilldownRootType, 'aggregated', aggregatedNodeId, {
      searchStatus,
      statusCount: searchStatusCount,
    });
  }

  private navigateToIterationDetails(
    drilldownRootType: DrilldownRootType,
    reportNodeId: string,
    searchFor?: string,
  ): void {
    this._drilldownNavigationUtils.openDrilldown(drilldownRootType, 'report', reportNodeId, undefined, searchFor);
  }
}
