import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertType } from '../../modules/basics/step-basics.module';

export interface ConfirmationDialogData {
  message: string;
}

export type ConfirmationDialogResult = boolean | undefined;

@Component({
  selector: 'step-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  private _dialogRef = inject<MatDialogRef<ConfirmationDialogComponent, ConfirmationDialogResult>>(MatDialogRef);

  readonly dialogData = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
  readonly AlertType = AlertType;

  onSubmit(): void {
    this._dialogRef.close(true);
  }
}
