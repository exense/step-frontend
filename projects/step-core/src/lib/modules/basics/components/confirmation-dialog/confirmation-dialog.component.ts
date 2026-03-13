import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertType } from '../../types/alert-type.enum';

export interface ConfirmationDialogData {
  message: string;
  cancelButtonLabel?: string;
  confirmButtonLabel?: string;
  cancelButtonAppearance?: 'flat' | 'stroked';
  confirmButtonAppearance?: 'flat' | 'stroked';
  cancelButtonColor?: 'primary';
  confirmButtonColor?: 'primary';
}

export type ConfirmationDialogResult = boolean | undefined;

@Component({
  selector: 'step-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  standalone: false,
})
export class ConfirmationDialogComponent {
  private _dialogRef = inject<MatDialogRef<ConfirmationDialogComponent, ConfirmationDialogResult>>(MatDialogRef);

  protected readonly _dialogData = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
  protected readonly AlertType = AlertType;

  @HostListener('keydown.enter')
  onSubmit(): void {
    this._dialogRef.close(true);
  }
}
