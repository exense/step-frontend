import { inject, Injectable } from '@angular/core';
import { a1Promise2Observable, DialogsService, ScreensService } from '@exense/step-core';
import { Observable, switchMap, of, catchError, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ScreenInputEditDialogComponent } from '../components/screen-input-edit-dialog/screen-input-edit-dialog.component';
import { ScreenInputEditDialogData } from '../shared/screen-input-edit-dialog-data.interface';

@Injectable({
  providedIn: 'root',
})
export class ScreenDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _screensService = inject(ScreensService);

  editScreen(data: ScreenInputEditDialogData): Observable<boolean> {
    return this._matDialog
      .open(ScreenInputEditDialogComponent, {
        data,
      })
      .afterClosed();
  }

  removeScreen(dbId: string, label: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Screen "${label}"`)).pipe(
      switchMap((_) => this._screensService.deleteInput(dbId)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
