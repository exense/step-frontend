import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertType } from '../../types/alert-type.enum';

export interface ConfirmationDialogData {
  message: string;
  alertType?: AlertType;
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
  readonly alertType = this.dialogData.alertType ?? AlertType.DANGER;

  @HostListener('keydown.enter')
  onSubmit(): void {
    this._dialogRef.close(true);
  }
}
