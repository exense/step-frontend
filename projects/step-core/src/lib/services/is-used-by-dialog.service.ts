import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IsUsedByModalComponent } from '../components/is-used-by-modal/is-used-by-modal.component';
import { IsUsedByDialog, IsUsedByDialogData, IsUsedBySearchType } from '../modules/basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class IsUsedByDialogService implements IsUsedByDialog {
  private _dialog = inject(MatDialog);

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
