import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReportNode } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { Status } from '../../../_common/shared/status.enum';

export enum AggregatedTreeNodeDialogMode {
  AGGREGATED,
  ITERATION,
}

export interface AggregatedTreeNodeDialogData {
  aggregatedNode?: AggregatedTreeNode;
  reportNode?: ReportNode;
  searchStatus?: Status;
  mode: AggregatedTreeNodeDialogMode;
}

@Component({
  selector: 'step-aggregated-tree-node-dialog',
  templateUrl: './aggregated-tree-node-dialog.component.html',
  styleUrl: './aggregated-tree-node-dialog.component.scss',
})
export class AggregatedTreeNodeDialogComponent implements OnInit {
  private readonly _data = inject<AggregatedTreeNodeDialogData>(MAT_DIALOG_DATA);
  private readonly _dialogRef = inject(MatDialogRef);

  private readonly modeInternal = signal(this._data.mode);
  protected readonly mode = this.modeInternal.asReadonly();
  protected readonly selectedReportNode = signal(this._data.reportNode);
  protected readonly aggregatedNode = this._data.aggregatedNode;
  protected readonly initialSearchStatus = this._data.searchStatus;
  protected readonly hasData = !!this._data.aggregatedNode || !!this._data.reportNode;

  protected readonly AggregatedTreeNodeDialogMode = AggregatedTreeNodeDialogMode;

  protected title = computed(() => {
    const mode = this.modeInternal();
    const reportNode = this.selectedReportNode();
    if (mode === AggregatedTreeNodeDialogMode.AGGREGATED) {
      return 'Aggregated details';
    }
    if (!reportNode) {
      return 'Iteration list';
    }
    return 'Iteration details';
  });

  ngOnInit(): void {
    if (!this.hasData) {
      this._dialogRef.close();
    }
  }

  protected switchToAggregated(): void {
    this.modeInternal.set(AggregatedTreeNodeDialogMode.AGGREGATED);
    this.selectedReportNode.set(undefined);
  }

  protected switchToIteration(): void {
    this.modeInternal.set(AggregatedTreeNodeDialogMode.ITERATION);
    this.selectedReportNode.set(undefined);
  }
}
