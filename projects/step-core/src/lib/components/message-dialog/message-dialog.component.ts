import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertType } from '../../step-core.module';

export interface MessageDialogData {
  messageHTML: string;
}

export type MessageDialogResult = boolean | undefined;

@Component({
  selector: 'step-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
  private _dialogRef = inject<MatDialogRef<MessageDialogComponent, MessageDialogResult>>(MatDialogRef);

  readonly dialogData = inject<MessageDialogData>(MAT_DIALOG_DATA);
  readonly AlertType = AlertType;

  onSubmit(): void {
    this._dialogRef.close(true);
  }
}
