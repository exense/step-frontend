import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AsyncOperationDialogState } from '../../shared/async-operation-dialog-state.enum';
import { AsyncOperationDialogOptions } from '../../shared/async-operation-dialog-options';
import { Mutable } from '../../../../shared';
import { pollAsyncTask } from '../../../../client/augmented/step-augmented-client.module';
import { AsyncTasksService } from '../../../../client/generated';
import { catchError, switchMap } from 'rxjs/operators';
import { map, of, timer } from 'rxjs';

type FieldAccessor = Mutable<Pick<AsyncOperationDialogComponent, 'state' | 'progress'>>;

@Component({
  selector: 'step-async-operation-dialog',
  templateUrl: './async-operation-dialog.component.html',
  styleUrls: ['./async-operation-dialog.component.scss'],
})
export class AsyncOperationDialogComponent {
  readonly AsyncOperationDialogState = AsyncOperationDialogState;
  readonly state: AsyncOperationDialogState = AsyncOperationDialogState.confirm;
  readonly progress: number = 0;

  constructor(
    private _dialogRef: MatDialogRef<AsyncOperationDialogComponent>,
    private _asyncService: AsyncTasksService,
    @Inject(MAT_DIALOG_DATA) public _dialogData: AsyncOperationDialogOptions
  ) {}

  close(): void {
    if (this.state === AsyncOperationDialogState.confirm && this._dialogData.onSuccess) {
      this._dialogData.onSuccess(undefined);
    }
    this._dialogRef.close();
  }

  performAnOperation(): void {
    (this as FieldAccessor).state = AsyncOperationDialogState.progress;
    this._dialogData
      .asyncOperation()
      .pipe(
        pollAsyncTask(this._asyncService, (progress) => {
          (this as FieldAccessor).progress = progress * 100;
        }),
        catchError((err) => {
          (this as FieldAccessor).state = AsyncOperationDialogState.error;
          if (this._dialogData.onError) {
            this._dialogData.onError(err);
          }
          console.error(err);
          return of(undefined);
        }),
        // A small delay to show the last progress value
        switchMap((result) => timer(500).pipe(map(() => result)))
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        (this as FieldAccessor).state = AsyncOperationDialogState.success;
        if (this._dialogData.onSuccess) {
          this._dialogData.onSuccess(result);
        }
      });
  }
}
