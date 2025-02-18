import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ArtefactService, ReportNode } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { Status } from '../../../_common/shared/status.enum';
import { ActivatedRoute } from '@angular/router';

export interface AggregatedTreeNodeDialogData {
  aggregatedNode?: AggregatedTreeNode;
  reportNode?: ReportNode;
  searchStatus?: Status;
  reportNodeChildren: ReportNode[];
}

@Component({
  selector: 'step-aggregated-tree-node-dialog',
  templateUrl: './aggregated-tree-node-dialog.component.html',
  styleUrl: './aggregated-tree-node-dialog.component.scss',
})
export class AggregatedTreeNodeDialogComponent implements OnInit {
  private _data = inject<AggregatedTreeNodeDialogData>(MAT_DIALOG_DATA);
  private _dialogRef = inject(MatDialogRef);
  private _artefactTypes = inject(ArtefactService);
  protected readonly _activatedRoute = inject(ActivatedRoute);

  protected readonly selectedReportNode = signal(this._data.reportNode);
  protected readonly aggregatedNode = this._data.aggregatedNode;
  protected readonly initialSearchStatus = this._data.searchStatus;
  protected readonly hasData = !!this._data.aggregatedNode || !!this._data.reportNode;
  protected readonly hasBackButton = !this._data.reportNode;

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
}
