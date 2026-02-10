import { Component, computed, inject, OnInit, ViewEncapsulation, effect, untracked } from '@angular/core';
import { AugmentedControllerService, ReportNode } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Status } from '../../../_common/shared/status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AggregatedTreeNodeDialogHooksService } from '../../services/aggregated-tree-node-dialog-hooks.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { DOCUMENT } from '@angular/common';
import { NODE_DETAILS_RELATIVE_PARENT } from '../../services/node-details-relative-parent.token';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltReportNodeDetailsStateService } from '../../services/alt-report-node-details-state.service';
import { filter, map, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AggregatedReportViewTreeStateContextService } from '../../services/aggregated-report-view-tree-state.service';
import { HashContainer } from '../aggregated-tree-node-history/aggregated-tree-node-history.component';

export interface AggregatedTreeNodeDialogData {
  aggregatedNodeId?: string;
  resolvedPartialPath?: string;
  reportNodeId?: string;
  searchStatus?: Status;
  searchStatusCount?: number;
  reportNodeChildren: ReportNode[];
}

@Component({
  selector: 'step-aggregated-tree-node-dialog',
  templateUrl: './aggregated-tree-node-dialog.component.html',
  styleUrl: './aggregated-tree-node-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [
    {
      provide: NODE_DETAILS_RELATIVE_PARENT,
      useFactory: () => inject(ActivatedRoute).parent!.parent!,
    },
    AltExecutionDialogsService,
  ],
  host: {
    '[class.is-report]': '!!selectedReportNode()',
  },
})
export class AggregatedTreeNodeDialogComponent implements OnInit {
  private _data = inject<AggregatedTreeNodeDialogData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);
  private _doc = inject(DOCUMENT);
  private _treeState = inject(AggregatedReportViewTreeStateContextService).getState();
  protected _dialogsService = inject(AltExecutionDialogsService);
  private _router = inject(Router);
  private _hooks = inject(AggregatedTreeNodeDialogHooksService);

  private _executionState = inject(AltExecutionStateService);
  private _reportNodeDetailsState = inject(AltReportNodeDetailsStateService);
  private _controllerService = inject(AugmentedControllerService);

  protected readonly _activatedRoute = inject(ActivatedRoute);

  private isInitialLoad = true;
  private lastReportNode?: ReportNode;

  private aggregatedNode$ = this._executionState.timeRange$.pipe(
    switchMap(() => this._treeState.isInitialized$),
    filter((isInitialized) => isInitialized),
    map(() => this._data.aggregatedNodeId),
    map((aggregatedNodeId) => {
      if (!aggregatedNodeId) {
        return undefined;
      }
      return this._treeState.findNodeById(aggregatedNodeId);
    }),
  );

  private reportNode$ = this._executionState.timeRange$.pipe(
    map((range) => ({ range, reportNodeId: this._data.reportNodeId })),
    switchMap(({ range, reportNodeId }) => {
      if (!reportNodeId) {
        this.isInitialLoad = false;
        return of(undefined);
      }

      const isManualChange = !!range?.isManualChange;
      const hasSameNode = this.lastReportNode?.id === reportNodeId;
      if (!isManualChange && hasSameNode && this.lastReportNode?.status !== Status.RUNNING) {
        return of(this.lastReportNode);
      }

      let reportNode: ReportNode | undefined = undefined;
      if (this.isInitialLoad) {
        reportNode = this._reportNodeDetailsState.getReportNode(reportNodeId);
      }
      this.isInitialLoad = false;
      if (reportNode) {
        this.lastReportNode = reportNode;
        return of(reportNode);
      }

      return this._controllerService.getReportNode(reportNodeId).pipe(
        map((node) => {
          this.lastReportNode = node;
          return node;
        }),
      );
    }),
  );

  protected readonly selectedReportNode = toSignal(this.reportNode$);
  protected readonly aggregatedNode = toSignal(this.aggregatedNode$);
  protected readonly historyHashContainer = computed<HashContainer | undefined>(() => {
    const aggregatedNode = this.aggregatedNode();
    if (!aggregatedNode?.artefactHash) {
      return undefined;
    }
    return { artefactHash: aggregatedNode.artefactHash };
  });

  protected readonly resolvedPartialPath = this._data.resolvedPartialPath;
  protected readonly initialSearchStatus = this._data.searchStatus;
  protected readonly initialSearchStatusCount = this._data.searchStatusCount;
  protected readonly hasData = computed(() => {
    const aggregatedNode = this.aggregatedNode();
    const reportNode = this.selectedReportNode();
    return !!aggregatedNode || !!reportNode;
  });
  protected readonly hasBackButton = computed(() => !!this.selectedReportNode());

  private effectNotifyReportNodeOpen = effect(() => {
    const selectedReportNode = this.selectedReportNode();
    if (!selectedReportNode) {
      return;
    }
    untracked(() => this._hooks?.reportNodeOpened(selectedReportNode));
  });

  protected readonly endTime = computed(() => {
    const reportNode = this.selectedReportNode();
    if (!reportNode) {
      return undefined;
    }
    return reportNode.executionTime! + reportNode.duration!;
  });

  ngOnInit(): void {
    if (!this.hasData) {
      this._dialogRef.close();
    }
  }

  protected handleOpenTreeView(node: ReportNode): void {
    this._router
      .navigate(['.', 'sub-tree', node.id], { relativeTo: this._activatedRoute!.parent!.parent! })
      .then(() => this._dialogRef.close());
  }

  protected handleOpenDetails(node: ReportNode): void {
    this._dialogsService.openIterationDetails(node);
  }

  protected navigateBack(): void {
    this._doc.defaultView?.history?.back?.();
  }
}
