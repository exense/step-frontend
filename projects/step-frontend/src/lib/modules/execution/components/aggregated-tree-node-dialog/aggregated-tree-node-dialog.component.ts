import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReportNode } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { Status } from '../../../_common/shared/status.enum';

export interface AggregatedTreeNodeDialogData {
  aggregatedNode?: AggregatedTreeNode;
  reportNode?: ReportNode;
  searchStatus?: Status;
}

@Component({
  selector: 'step-aggregated-tree-node-dialog',
  templateUrl: './aggregated-tree-node-dialog.component.html',
  styleUrl: './aggregated-tree-node-dialog.component.scss',
})
export class AggregatedTreeNodeDialogComponent implements OnInit {
  private readonly _data = inject<AggregatedTreeNodeDialogData>(MAT_DIALOG_DATA);
  private readonly _dialogRef = inject(MatDialogRef);

  protected readonly selectedReportNode = signal(this._data.reportNode);
  protected readonly aggregatedNode = this._data.aggregatedNode;
  protected readonly initialSearchStatus = this._data.searchStatus;
  protected readonly hasData = !!this._data.aggregatedNode || !!this._data.reportNode;
  protected readonly hasBackButton = !this._data.reportNode;

  protected title = computed(() => {
    const reportNode = this.selectedReportNode();
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
}
