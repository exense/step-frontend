import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AsyncOperationDialogOptions } from '../shared/async-operation-dialog-options';
import { from, Observable } from 'rxjs';
import { AsyncTaskStatus } from '../../../client/step-client-module';
import { AsyncOperationDialogComponent } from '../components/async-operation-dialog/async-operation-dialog.component';

export type AsyncOperationMessages = Pick<
  AsyncOperationDialogOptions,
  'title' | 'confirmMessage' | 'successMessage' | 'errorMessage'
>;

@Injectable({
  providedIn: 'root',
})
export class AsyncOperationService {
  constructor(private _dialog: MatDialog) {}

  performOperation(
    asyncOperation: () => Observable<AsyncTaskStatus>,
    messages: AsyncOperationMessages
  ): Observable<AsyncTaskStatus | undefined> {
    let onSuccess: AsyncOperationDialogOptions['onSuccess'] = undefined;
    let onError: AsyncOperationDialogOptions['onError'] = undefined;

    const resultPromise = new Promise<AsyncTaskStatus | undefined>((resolve, reject) => {
      onSuccess = resolve;
      onError = reject;
    });

    const data: AsyncOperationDialogOptions = {
      ...messages,
      asyncOperation,
      onSuccess,
      onError,
    };

    this._dialog.open(AsyncOperationDialogComponent, {
      data,
      width: '40rem',
      disableClose: true,
    });

    return from(resultPromise);
  }
}
