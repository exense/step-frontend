import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AugmentedExecutionsService,
  ExecutiontTaskParameters,
  ReportNode,
  ScheduledTaskTemporaryStorageService,
} from '@exense/step-core';
import { AltReportNodeDetailsStateService } from './alt-report-node-details-state.service';
import {
  AGGREGATED_TREE_TAB_STATE,
  AggregatedReportViewTreeStateService,
} from './aggregated-report-view-tree-state.service';
import { map, Observable } from 'rxjs';
import { EXECUTION_ID } from './execution-id.token';
import { Status } from '../../_common/shared/status.enum';
import { SchedulerInvokerService } from './scheduler-invoker.service';

@Injectable()
export class AltExecutionDialogsService implements SchedulerInvokerService {
  private _executionsApi = inject(AugmentedExecutionsService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _reportNodeDetails = inject(AltReportNodeDetailsStateService);
  private _treeState = inject(AGGREGATED_TREE_TAB_STATE);
  private _executionId = inject(EXECUTION_ID);

  openTreeNodeDetails(nodeId: string, nodeStatus?: Status): void {
    const node = this._treeState.findNodeById(nodeId)!;
    const itemsCounts = Object.values(node.countByStatus ?? {});
    if (itemsCounts.length === 1 && itemsCounts[0] === 1 && node.artefactHash) {
      this.getSingleRunReportNode(node.artefactHash).subscribe((reportNode) => this.openReportNodeDetails(reportNode));
      return;
    }
    this.navigateToTreeNodeDetails(nodeId, nodeStatus);
  }

  openReportNodeDetails<T extends ReportNode>(reportNode: T): void {
    this._reportNodeDetails.setReportNode(reportNode);
    this.navigateToReportNodeDetails(reportNode.id!);
  }

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], {
      relativeTo: this._activatedRoute,
    });
  }

  private navigateToTreeNodeDetails(nodeId: string, nodeStatus?: Status): void {
    this._router.navigate([{ outlets: { aggregatedNode: ['aggregated-info', nodeId], reportNode: [] } }], {
      relativeTo: this._activatedRoute,
      queryParams: { nodeStatus },
      queryParamsHandling: 'merge',
    });
  }

  private navigateToReportNodeDetails(reportNodeId: string): void {
    this._router.navigate([{ outlets: { reportNode: ['report-node', reportNodeId], aggregatedNode: [] } }], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  private getSingleRunReportNode(artefactHash: string): Observable<ReportNode> {
    return this._executionsApi
      .getReportNodesByArtefactHash(this._executionId(), artefactHash)
      .pipe(map((response) => response[0]));
  }
}
