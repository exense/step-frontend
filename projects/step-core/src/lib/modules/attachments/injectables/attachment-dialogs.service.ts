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
    const isLarge = type === AttachmentType.TRACE;
    this._matDialog.open(AttachmentDialogComponent, {
      data,
      width: isLarge ? '95vw' : '80vw',
      maxWidth: isLarge ? '95vw' : '80vw',
      height: isLarge ? '90vh' : 'auto',
      maxHeight: isLarge ? '90vh' : 'auto',
      panelClass: isLarge ? 'large' : undefined,
    });
  }
}
