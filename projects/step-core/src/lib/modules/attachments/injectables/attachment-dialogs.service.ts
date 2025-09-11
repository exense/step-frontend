import { inject, Injectable } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentDialogComponent } from '../components/attachment-dialog/attachment-dialog.component';
import { AttachmentUtilsService } from './attachment-utils.service';
import { AttachmentType } from '../types/attachment-type.enum';

@Injectable({
  providedIn: 'root',
})
export class AttachmentDialogsService {
  private _matDialog = inject(MatDialog);
  private _attachmentUtils = inject(AttachmentUtilsService);

  showDetails(data: AttachmentMeta): void {
    const type = this._attachmentUtils.determineAttachmentType(data);
    const isTrace = type === AttachmentType.TRACE;
    this._matDialog.open(AttachmentDialogComponent, {
      data,
      width: isTrace ? '95vw' : '80vw',
      maxWidth: isTrace ? '95vw' : '80vw',
      height: isTrace ? '90vh' : 'auto',
      maxHeight: isTrace ? '90vh' : 'auto',
      panelClass: isTrace ? 'trace' : undefined,
    });
  }
}
