import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RestoreDialogComponent } from '../components/restore-dialog/restore-dialog.component';
import { History } from '../client/generated';
import { RestoreDialogData } from '../modules/basics/shared/restore-dialog-data';

@Injectable({
  providedIn: 'root',
})
export class RestoreDialogsService {
  constructor(private _matDialog: MatDialog) {}

  showRestoreDialog(version: string, history: Observable<History[]>, permission: string): Observable<string> {
    const matDialogConfig: MatDialogConfig<RestoreDialogData> = {
      data: { version, history, permission },
    };
    const dialogRef = this._matDialog.open(RestoreDialogComponent, matDialogConfig);
    return dialogRef.afterClosed() as Observable<string>;
  }
}
