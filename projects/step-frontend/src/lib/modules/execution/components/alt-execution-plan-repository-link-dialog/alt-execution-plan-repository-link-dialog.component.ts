import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AltExecutionPlanRepositoryLinkDialogData {
  repositoryId: string;
}

export type AltExecutionPlanRepositoryLinkDialogResult = 'step' | 'repository' | undefined;

@Component({
  selector: 'step-alt-execution-plan-repository-link-dialog',
  templateUrl: './alt-execution-plan-repository-link-dialog.component.html',
  styleUrl: './alt-execution-plan-repository-link-dialog.component.scss',
  standalone: false,
})
export class AltExecutionPlanRepositoryLinkDialogComponent {
  private _dialogRef =
    inject<
      MatDialogRef<AltExecutionPlanRepositoryLinkDialogComponent, AltExecutionPlanRepositoryLinkDialogResult>
    >(MatDialogRef);

  protected readonly _data = inject<AltExecutionPlanRepositoryLinkDialogData>(MAT_DIALOG_DATA);

  protected openPlanInStep(): void {
    this._dialogRef.close('step');
  }

  protected openRepositoryPlan(): void {
    this._dialogRef.close('repository');
  }
}
