import { inject, Injectable } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentDialogComponent } from '../components/attachment-dialog/attachment-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AttachmentDialogsService {
  private _matDialog = inject(MatDialog);

  showDetails(data: AttachmentMeta): void {
    this._matDialog.open(AttachmentDialogComponent, {
      data,
    });
  }
}
