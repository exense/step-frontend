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

@Injectable()
export class AltExecutionDialogsService implements SchedulerInvokerService {
  private _executionsApi = inject(AugmentedExecutionsService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _reportNodeDetails = inject(AltReportNodeDetailsStateService);
  private _executionId = inject(EXECUTION_ID);
  private _queryParamsNames = inject(REPORT_NODE_DETAILS_QUERY_PARAMS);

  openIterations(
    node: AggregatedTreeNode,
    { nodeStatus, reportNodeId }: { nodeStatus?: Status; reportNodeId?: string } = {},
  ): void {
    const nodeId = node.id;
    if (!!reportNodeId) {
      this.navigateToIterationDetails(reportNodeId, nodeId);
      return;
    }
    const itemsCounts = Object.values(node.countByStatus ?? {});
    if (itemsCounts.length === 1 && itemsCounts[0] === 1 && node.artefactHash) {
      this.getSingleRunReportNode(node.artefactHash).subscribe((reportNode) => {
        this._reportNodeDetails.setReportNode(reportNode);
        this.navigateToIterationDetails(reportNode.id!, nodeId);
      });
      return;
    }
    this.navigateToIterationList(nodeId, nodeStatus);
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

  private navigateToIterationList(aggregatedNodeId: string, searchStatus?: Status): void {
    const queryParams: Params = {};
    queryParams[this._queryParamsNames.aggregatedNodeId] = aggregatedNodeId;
    queryParams[this._queryParamsNames.searchStatus] = searchStatus;
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
}
