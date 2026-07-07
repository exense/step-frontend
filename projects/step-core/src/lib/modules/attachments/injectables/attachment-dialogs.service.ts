import { inject, Injectable } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentDialogComponent } from '../components/attachment-dialog/attachment-dialog.component';
import { AttachmentUtilsService } from './attachment-utils.service';
import { AttachmentType } from '../types/attachment-type.enum';
import { filter } from 'rxjs';
import { FILE_TYPES } from '../../basics/step-basics.module';
import {
  AttachmentDownloadConfirmationDialogComponent,
  AttachmentDownloadConfirmationDialogData,
  AttachmentDownloadConfirmationDialogResult,
} from '../components/attachment-download-confirmation-dialog/attachment-download-confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AttachmentDialogsService {
  private _matDialog = inject(MatDialog);
  private _attachmentUtils = inject(AttachmentUtilsService);

  showDetails(data: AttachmentMeta): void {
    const type = this._attachmentUtils.determineAttachmentType(data);
    if (this.shouldConfirmDownload(data, type)) {
      this.showDownloadConfirmation(data);
      return;
    }

    const isTrace = type === AttachmentType.TRACE;
    this._matDialog.open(AttachmentDialogComponent, {
      data,
      width: isTrace ? '95vw' : '88vw',
      maxWidth: isTrace ? '95vw' : '88vw',
      height: isTrace ? '90vh' : 'auto',
      maxHeight: isTrace ? '90vh' : 'auto',
      panelClass: isTrace ? 'trace' : undefined,
    });
  }

  private showDownloadConfirmation(data: AttachmentMeta): void {
    const dialogRef = this._matDialog.open<
      AttachmentDownloadConfirmationDialogComponent,
      AttachmentDownloadConfirmationDialogData,
      AttachmentDownloadConfirmationDialogResult
    >(AttachmentDownloadConfirmationDialogComponent, {
      data: {
        fileName: data.name ?? 'the attachment',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((confirmed) => !!confirmed))
      .subscribe(() => this._attachmentUtils.downloadAttachment(data));
  }

  private shouldConfirmDownload(data: AttachmentMeta, type: AttachmentType): boolean {
    if (type === AttachmentType.STREAMING_BINARY) {
      return true;
    }

    return type === AttachmentType.DEFAULT && !this.isPdfAttachment(data);
  }

  private isPdfAttachment(data: AttachmentMeta): boolean {
    const mimeType = data.mimeType?.toLowerCase();
    if (mimeType === FILE_TYPES.PDF.mimeType) {
      return true;
    }
    return data.name?.split('.').pop()?.toLowerCase() === FILE_TYPES.PDF.extension;
  }
}
