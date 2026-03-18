import { Location } from '@angular/common';
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
import {
  ExecutionDrilldownLeafPanel,
  ExecutionDrilldownSource,
  ExecutionDrilldownStateService,
} from './execution-drilldown-state.service';

export interface OpenIterationsParams {
  aggregatedNodeId: string;
  countByStatus?: Record<string, number>;
  singleInstanceReportNode?: ReportNodeWithArtefact<AbstractArtefact>;
  nodeStatus?: Status;
  reportNodeId?: string;
  nodeStatusCount?: number;
  searchFor?: string;
  source?: ExecutionDrilldownSource;
  panelTitle?: string;
}

export type PartialOpenIterationsParams = Pick<
  OpenIterationsParams,
  'nodeStatus' | 'reportNodeId' | 'nodeStatusCount' | 'searchFor' | 'source' | 'panelTitle'
>;

@Injectable()
export class AltExecutionDialogsService implements SchedulerInvokerService {
  private _router = inject(Router);
  private _location = inject(Location);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _reportNodeDetails = inject(AltReportNodeDetailsStateService, { optional: true });
  private _queryParamsNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);
  private _matDialog = inject(MatDialog);
  private _nodeDetailsRelativeParent = inject(NODE_DETAILS_RELATIVE_PARENT, { optional: true }) ?? this._activatedRoute;
  private _drilldownState = inject(ExecutionDrilldownStateService);

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
      this.openIterations({
        aggregatedNodeId,
        countByStatus,
        singleInstanceReportNode,
        panelTitle: node.name,
        ...restParams,
      });
      return;
    }

    const {
      aggregatedNodeId,
      countByStatus,
      reportNodeId,
      nodeStatus,
      nodeStatusCount,
      singleInstanceReportNode,
      searchFor,
      source,
      panelTitle,
    } = nodeOrParams as OpenIterationsParams;
    if (!!reportNodeId) {
      this.openPanelAndNavigate(this.createReportNodePanel(reportNodeId, panelTitle), source, searchFor);
      return;
    }
    const itemsCounts = Object.values(countByStatus ?? {});
    if (itemsCounts.length === 1 && itemsCounts[0] === 1) {
      const reportNode = singleInstanceReportNode!;
      this._reportNodeDetails?.setReportNode?.(reportNode);
      this.openPanelAndNavigate(this.createReportNodePanel(reportNode.id!, reportNode.name), source, searchFor);
      return;
    }
    this.openPanelAndNavigate(
      this.createIterationPanel(aggregatedNodeId, nodeStatus, nodeStatusCount, panelTitle),
      source,
      searchFor,
    );
  }

  openIterationDetails<T extends ReportNode>(reportNode: T, source?: ExecutionDrilldownSource): void {
    this._reportNodeDetails?.setReportNode?.(reportNode);
    this.openPanelAndNavigate(this.createReportNodePanel(reportNode.id!, reportNode.name), source);
  }

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], {
      relativeTo: this._activatedRoute,
    });
  }

  syncRouteToPanel(panel: ExecutionDrilldownLeafPanel): void {
    if (panel.kind === 'node-details') {
      this.navigateToIterationDetails(panel.reportNodeId!);
      return;
    }

    this.navigateToIterationList(panel.aggregatedNodeId!, panel.searchStatus, panel.searchStatusCount);
  }

  replaceUrlToPanel(panel: ExecutionDrilldownLeafPanel): void {
    this.replaceUrlToPanelDescriptor(panel);
  }

  private replaceUrlToPanelDescriptor(panel: Pick<
    ExecutionDrilldownLeafPanel,
    'kind' | 'reportNodeId' | 'aggregatedNodeId' | 'searchStatus' | 'searchStatusCount'
  >): void {
    const urlTree =
      panel.kind === 'node-details'
        ? this.createNodeDetailsUrlTree(`rnid_${panel.reportNodeId}`)
        : this.createNodeDetailsUrlTree(`agid_${panel.aggregatedNodeId}`, {
            [this._queryParamsNames.searchStatus]: panel.searchStatus,
            [this._queryParamsNames.searchStatusCount]: panel.searchStatusCount,
          });

    this._location.replaceState(this._router.serializeUrl(urlTree));
  }

  private navigateToIterationList(aggregatedNodeId: string, searchStatus?: Status, searchStatusCount?: number): void {
    const queryParams: Params = {};
    queryParams[this._queryParamsNames.searchStatus] = searchStatus;
    queryParams[this._queryParamsNames.searchStatusCount] = searchStatusCount;
    this.openNodeDetails(`agid_${aggregatedNodeId}`, queryParams);
  }

  private navigateToIterationDetails(reportNodeId: string, queryParams: Params = {}, searchFor?: string): void {
    this.openNodeDetails(`rnid_${reportNodeId}`, queryParams, searchFor);
  }

  private openNodeDetails(detailsId: string, queryParams: Params, searchFor?: string): void {
    const urlTree = this.createNodeDetailsUrlTree(detailsId, queryParams, searchFor);
    this._router.navigateByUrl(urlTree);
  }

  private createNodeDetailsUrlTree(detailsId: string, queryParams: Params = {}, searchFor?: string) {
    const mergedParams = { ...queryParams };
    if (searchFor) {
      mergedParams['searchFor'] = searchFor;
    }

    return this._router.createUrlTree([{ outlets: { nodeDetails: ['node-details', detailsId] } }], {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParams: mergedParams,
      queryParamsHandling: 'merge',
    });
  }

  private openPanelAndNavigate(
    panel: Omit<ExecutionDrilldownLeafPanel, 'instanceId'>,
    source?: ExecutionDrilldownSource,
    searchFor?: string,
  ): void {
    if (source) {
      this._drilldownState.openFromRoot(source, panel);
    } else {
      this._drilldownState.openNested(panel);
    }

    if (this.isDrilldownDialogOpen()) {
      this.replaceUrlToPanelDescriptor(panel);
      return;
    }

    if (panel.kind === 'node-details') {
      this.navigateToIterationDetails(panel.reportNodeId!, {}, searchFor);
      return;
    }

    this.navigateToIterationList(panel.aggregatedNodeId!, panel.searchStatus, panel.searchStatusCount);
  }

  private createIterationPanel(
    aggregatedNodeId: string,
    searchStatus?: Status,
    searchStatusCount?: number,
    title?: string,
  ): Omit<ExecutionDrilldownLeafPanel, 'instanceId'> {
    const routeKey = this.createIterationRouteKey(aggregatedNodeId, searchStatus, searchStatusCount);
    return {
      routeKey,
      kind: 'iteration-list',
      aggregatedNodeId,
      searchStatus,
      searchStatusCount,
      title,
    };
  }

  private createReportNodePanel(reportNodeId: string, title?: string): Omit<ExecutionDrilldownLeafPanel, 'instanceId'> {
    return {
      routeKey: this.createReportNodeRouteKey(reportNodeId),
      kind: 'node-details',
      reportNodeId,
      title,
    };
  }

  private createIterationRouteKey(aggregatedNodeId: string, searchStatus?: Status, searchStatusCount?: number): string {
    return `agid_${aggregatedNodeId}:${searchStatus ?? ''}:${searchStatusCount ?? ''}`;
  }

  private createReportNodeRouteKey(reportNodeId: string): string {
    return `rnid_${reportNodeId}`;
  }

  private isDrilldownDialogOpen(): boolean {
    return this._matDialog.openDialogs.some(
      (dialogRef) => dialogRef.componentInstance?.constructor?.name === 'AggregatedTreeNodeDialogComponent',
    );
  }
}
