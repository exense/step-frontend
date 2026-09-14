import { inject, Injectable, Injector } from '@angular/core';
import { FilePickerModalData } from '../types/file-picker-modal-data';
import { Observable } from 'rxjs';
import { FilePickerModalResult } from '../types/file-picker-modal-result';
import { MatDialog } from '@angular/material/dialog';
import { FilePickerModalComponent } from '../components/file-picker-modal/file-picker-modal.component';
import { SelectionMode } from '../types/selection-mode.enum';

@Injectable()
export class FilePickerService {
  private _matDialog = inject(MatDialog);
  private _injector = inject(Injector);

  showFilePicker(
    title: string,
    params: Omit<FilePickerModalData, 'title'> = {},
  ): Observable<FilePickerModalResult | undefined> {
    return this._matDialog
      .open<FilePickerModalComponent, FilePickerModalData, FilePickerModalResult>(FilePickerModalComponent, {
        data: {
          title,
          ...params,
          selectionMode: params.selectionMode ?? SelectionMode.BOTH,
        },
        injector: this._injector,
      })
      .afterClosed();
  }
}
