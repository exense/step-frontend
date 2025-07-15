import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertType } from '../../types/alert-type.enum';

export interface MessagesListDialogData {
  messages: string[];
}

export type MessagesListDialogResult = boolean | undefined;

@Component({
  selector: 'step-messages-list-dialog',
  templateUrl: './messages-list-dialog.component.html',
  styleUrls: ['./messages-list-dialog.component.scss'],
  standalone: false,
})
export class MessagesListDialogComponent {
  private _dialogRef = inject<MatDialogRef<MessagesListDialogComponent, MessagesListDialogResult>>(MatDialogRef);

  readonly dialogData = inject<MessagesListDialogData>(MAT_DIALOG_DATA);
  readonly AlertType = AlertType;

  onSubmit(): void {
    this._dialogRef.close(true);
  }
}
