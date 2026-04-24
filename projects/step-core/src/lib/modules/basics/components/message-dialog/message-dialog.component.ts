import { AfterViewInit, Component, HostListener, inject, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalWindowComponent } from '../modal-window/modal-window.component';
import { AlertType } from '../../types/alert-type.enum';

export interface MessageDialogData {
  messageHTML: string;
  alertType?: AlertType;
  hideOkButton?: boolean;
  hideCancelButton?: boolean;
  title?: string;
}

export type MessageDialogResult = boolean | undefined;

@Component({
  selector: 'step-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  standalone: false,
})
export class MessageDialogComponent implements AfterViewInit {
  private _dialogRef = inject<MatDialogRef<MessageDialogComponent, MessageDialogResult>>(MatDialogRef);

  readonly _dialogData = inject<MessageDialogData>(MAT_DIALOG_DATA);
  readonly alertType = this._dialogData.alertType ?? AlertType.DANGER;
  readonly dialogTitle = this._dialogData.title ?? '';
  readonly AlertType = AlertType;

  private readonly modalWindow = viewChild.required(ModalWindowComponent);

  ngAfterViewInit(): void {
    this.modalWindow().focusDialog();
  }

  @HostListener('keydown.enter')
  onSubmit(): void {
    this._dialogRef.close(true);
  }
}
