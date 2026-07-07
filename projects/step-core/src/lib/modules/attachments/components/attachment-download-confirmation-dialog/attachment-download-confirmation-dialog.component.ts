import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StepBasicsModule } from '../../../basics/step-basics.module';

export interface AttachmentDownloadConfirmationDialogData {
  fileName: string;
}

export type AttachmentDownloadConfirmationDialogResult = boolean | undefined;

@Component({
  selector: 'step-attachment-download-confirmation-dialog',
  templateUrl: './attachment-download-confirmation-dialog.component.html',
  imports: [StepBasicsModule],
})
export class AttachmentDownloadConfirmationDialogComponent {
  private _dialogRef =
    inject<MatDialogRef<AttachmentDownloadConfirmationDialogComponent, AttachmentDownloadConfirmationDialogResult>>(
      MatDialogRef,
    );

  protected readonly _data = inject<AttachmentDownloadConfirmationDialogData>(MAT_DIALOG_DATA);

  @HostListener('keydown.enter')
  protected download(): void {
    this._dialogRef.close(true);
  }
}
