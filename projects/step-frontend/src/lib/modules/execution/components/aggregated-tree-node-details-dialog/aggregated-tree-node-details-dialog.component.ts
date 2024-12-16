import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { Status } from '../../../_common/shared/status.enum';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-aggregated-tree-node-details-dialog',
  templateUrl: './aggregated-tree-node-details-dialog.component.html',
  styleUrl: './aggregated-tree-node-details-dialog.component.scss',
})
export class AggregatedTreeNodeDetailsDialogComponent {
  private _activatedRoute = inject(ActivatedRoute);

  protected readonly aggregatedNode = toSignal(
    this._activatedRoute.data.pipe(map((data) => data['node'] as AggregatedTreeNode | undefined)),
  );

  protected readonly predefinedStatus = toSignal(
    this._activatedRoute.queryParams.pipe(map((params) => params['nodeStatus'] as Status | undefined)),
  );

  private readonly displayDetailsFor = signal<ReportNode | undefined>(undefined);
  protected readonly isDetailsVisible = computed(() => !!this.displayDetailsFor());
  protected readonly reportNode = this.displayDetailsFor.asReadonly();

  protected openReportNodeDetails(reportNode: ReportNode) {
    this.displayDetailsFor.set(reportNode);
  }

  protected hideReportNodeDetails() {
    this.displayDetailsFor.set(undefined);
  }
}
