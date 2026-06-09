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
import { DrillDownStackItemType } from '../shared/drilldown-stack-item';

export interface OpenIterationsParams {
  aggregatedNodeId: string;
  countByStatus?: Record<string, number>;
  singleInstanceReportNode?: ReportNodeWithArtefact<AbstractArtefact>;
  nodeStatus?: Status;
  reportNodeId?: string;
  nodeStatusCount?: number;
  searchFor?: string;
  openPartialTree?: boolean;
}

export type PartialOpenIterationsParams = Pick<
  OpenIterationsParams,
  'nodeStatus' | 'reportNodeId' | 'nodeStatusCount' | 'searchFor' | 'openPartialTree'
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
    if (arguments.length === 3) {
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

    const { aggregatedNodeId, reportNodeId, nodeStatus, nodeStatusCount, searchFor, openPartialTree } =
      nodeOrParams as OpenIterationsParams;
    if (!!reportNodeId) {
      this.navigateToIterationDetails(drilldownRootType, reportNodeId, undefined, openPartialTree);
      return;
    }
    const reportNode = this._drilldownNavigationUtils.getSingleReportNode(nodeOrParams);
    if (!!reportNode) {
      this._reportNodeDetails?.setReportNode?.(reportNode);
      this._altExecutionNodesHelper?.cacheReportNode?.(reportNode);
      this.navigateToIterationDetails(drilldownRootType, reportNode.id!, searchFor, openPartialTree);
      return;
    }
    this.navigateToIterationList(drilldownRootType, aggregatedNodeId, nodeStatus, nodeStatusCount);
  }

  openIterationDetails<T extends ReportNode>(
    drilldownRootType: DrilldownRootType,
    reportNode: T,
    openPartialTree?: boolean,
  ): void {
    this._reportNodeDetails?.setReportNode?.(reportNode);
    this._altExecutionNodesHelper?.cacheReportNode?.(reportNode);
    this.navigateToIterationDetails(drilldownRootType, reportNode.id!, undefined, openPartialTree);
  }

  openDrilldownRoot(drilldownRootType: DrilldownRootType): void {
    this._drilldownNavigationUtils.openDrilldownRoot(drilldownRootType);
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
    this._drilldownNavigationUtils.openDrilldown(
      drilldownRootType,
      DrillDownStackItemType.AGGREGATED_REPORT_NODE,
      aggregatedNodeId,
      {
        searchStatus,
        statusCount: searchStatusCount,
      },
    );
  }

  private navigateToIterationDetails(
    drilldownRootType: DrilldownRootType,
    reportNodeId: string,
    searchFor?: string,
    openPartialTree?: boolean,
  ): void {
    if (openPartialTree) {
      this._drilldownNavigationUtils.openDrilldown(
        drilldownRootType,
        DrillDownStackItemType.PARTIAL_TREE,
        reportNodeId,
        undefined,
        searchFor,
      );
    } else {
      this._drilldownNavigationUtils.openDrilldown(
        drilldownRootType,
        DrillDownStackItemType.REPORT_NODE,
        reportNodeId,
        undefined,
        searchFor,
      );
    }
  }
}
