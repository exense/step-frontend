import { AfterViewInit, Component, HostListener, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertType, ModalWindowComponent } from '../../modules/basics/step-basics.module';

export interface MessageDialogData {
  messageHTML: string;
}

export type MessageDialogResult = boolean | undefined;

@Component({
  selector: 'step-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent implements AfterViewInit {
  private _dialogRef = inject<MatDialogRef<MessageDialogComponent, MessageDialogResult>>(MatDialogRef);

  readonly _dialogData = inject<MessageDialogData>(MAT_DIALOG_DATA);
  readonly AlertType = AlertType;

  @ViewChild(ModalWindowComponent, { static: true })
  private modalWindow!: ModalWindowComponent;

  ngAfterViewInit(): void {
    this.modalWindow.focusDialog();
  }

  @HostListener('keydown.enter')
  onSubmit(): void {
    this._dialogRef.close(true);
  }
}
