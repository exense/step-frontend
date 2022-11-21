import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IsUsedByModalComponent } from '../components/is-used-by-modal/is-used-by-modal.component';
import { IsUsedByDialogData } from '../shared/is-used-by-dialog-data';
import { IsUsedBySearchType } from '../shared/is-used-by-search-type';

@Injectable({
  providedIn: 'root',
})
export class IsUsedByDialogService {
  constructor(private _dialog: MatDialog) {}

  displayDialog(title: string, type: IsUsedBySearchType, id: string): void {
    this._dialog.open<IsUsedByModalComponent, IsUsedByDialogData>(IsUsedByModalComponent, {
      data: {
        title,
        type,
        id,
      },
    });
  }
}
