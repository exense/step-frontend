import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  protected readonly _data = inject<AttachmentDownloadConfirmationDialogData>(MAT_DIALOG_DATA);
}
