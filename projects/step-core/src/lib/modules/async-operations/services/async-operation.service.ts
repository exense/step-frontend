import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AsyncOperationDialogOptions } from '../shared/async-operation-dialog-options';
import { Observable } from 'rxjs';
import { AsyncOperationDialogComponent } from '../components/async-operation-dialog/async-operation-dialog.component';
import { AsyncOperationDialogResult } from '../shared/async-operation-dialog-result';

@Injectable({
  providedIn: 'root',
})
export class AsyncOperationService {
  constructor(private _dialog: MatDialog) {}

  performOperation(options: AsyncOperationDialogOptions): Observable<AsyncOperationDialogResult> {
    return this._dialog
      .open(AsyncOperationDialogComponent, {
        data: options,
        disableClose: true,
      })
      .afterClosed() as Observable<AsyncOperationDialogResult>;
  }
}
