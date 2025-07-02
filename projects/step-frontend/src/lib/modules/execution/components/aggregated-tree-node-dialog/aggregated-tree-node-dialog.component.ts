import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
  effect,
  untracked,
  OnDestroy,
} from '@angular/core';
import { ArtefactService, ReportNode } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { Status } from '../../../_common/shared/status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AggregatedTreeNodeDialogHooksService } from '../../services/aggregated-tree-node-dialog-hooks.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { DOCUMENT } from '@angular/common';

export interface AggregatedTreeNodeDialogData {
  aggregatedNode?: AggregatedTreeNode;
  resolvedPartialPath?: string;
  reportNode?: ReportNode;
  searchStatus?: Status;
  searchStatusCount?: number;
  reportNodeChildren: ReportNode[];
}

@Component({
  selector: 'step-aggregated-tree-node-dialog',
  templateUrl: './aggregated-tree-node-dialog.component.html',
  styleUrl: './aggregated-tree-node-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [AltExecutionDialogsService],
  standalone: false,
})
export class AggregatedTreeNodeDialogComponent implements OnInit {
  private _data = inject<AggregatedTreeNodeDialogData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);
  private _artefactTypes = inject(ArtefactService);
  private _doc = inject(DOCUMENT);
  protected _dialogsService = inject(AltExecutionDialogsService);
  private _router = inject(Router);
  private _hooks = inject(AggregatedTreeNodeDialogHooksService);
  protected readonly _activatedRoute = inject(ActivatedRoute);

  protected readonly selectedReportNode = signal(this._data.reportNode);
  protected readonly aggregatedNode = this._data.aggregatedNode;
  protected readonly resolvedPartialPath = this._data.resolvedPartialPath;
  protected readonly initialSearchStatus = this._data.searchStatus;
  protected readonly initialSearchStatusCount = this._data.searchStatusCount;
  protected readonly hasData = !!this._data.aggregatedNode || !!this._data.reportNode;
  protected readonly hasBackButton = !!this._data.reportNode;

  private effectNotifyReportNodeOpen = effect(() => {
    const selectedReportNode = this.selectedReportNode();
    if (!selectedReportNode) {
      return;
    }
    untracked(() => this._hooks?.reportNodeOpened(selectedReportNode));
  });

  protected readonly reportNodeArtefactClass = computed(() => {
    return this.selectedReportNode()?.resolvedArtefact?._class;
  });

  protected readonly reportNodeIcon = computed(() => {
    const artefactClass = this.reportNodeArtefactClass();
    if (!artefactClass) {
      return undefined;
    }
    return this._artefactTypes.getArtefactType(artefactClass)?.icon ?? this._artefactTypes.defaultIcon;
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
