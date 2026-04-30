import { Component, computed, inject, untracked, ViewEncapsulation } from '@angular/core';
import { AltReportNodeDetailsDirective } from '../../directives/alt-report-node-details.directive';
import { ReportNode } from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { PlanNodeDetailsDialogComponent } from '../plan-node-details-dialog/plan-node-details-dialog.component';

@Component({
  selector: 'step-alt-report-node-header',
  templateUrl: './alt-report-node-header.component.html',
  styleUrl: './alt-report-node-header.component.scss',
  standalone: false,
  hostDirectives: [
    {
      directive: AltReportNodeDetailsDirective,
      inputs: ['node'],
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeHeaderComponent {
  private _reportNodeDetailsDirective = inject(AltReportNodeDetailsDirective);
  private _matDialog = inject(MatDialog);

  protected readonly reportNode = computed(() => {
    const reportNode = this._reportNodeDetailsDirective.reportNode();
    return reportNode as ReportNode;
  });

  protected openPlanDialog(): void {
    const reportNode = untracked(() => this.reportNode());
    this._matDialog.open(PlanNodeDetailsDialogComponent, { data: { reportNode } });
  }
}
