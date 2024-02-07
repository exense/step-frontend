import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AugmentedScreenService, DialogsService } from '@exense/step-core';
import { filter, Observable, switchMap } from 'rxjs';
import { ScreenInputEditDialogComponent } from '../components/screen-input-edit-dialog/screen-input-edit-dialog.component';
import { ScreenInputEditDialogData } from '../shared/screen-input-edit-dialog-data.interface';

@Injectable({
  providedIn: 'root',
})
export class ScreenDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _screensService = inject(AugmentedScreenService);

  editScreen(data: ScreenInputEditDialogData): Observable<boolean> {
    return this._matDialog
      .open(ScreenInputEditDialogComponent, {
        data,
      })
      .afterClosed();
  }

  removeScreen(id: string, label: string, screenId?: string): Observable<any> {
    return this._dialogs.showDeleteWarning(1, `Screen "${label}"`).pipe(
      filter((result) => result),
      switchMap(() => this._screensService.deleteInput(id, screenId)),
    );
  }
}
