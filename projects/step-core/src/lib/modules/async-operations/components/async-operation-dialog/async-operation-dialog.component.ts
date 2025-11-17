import { AfterViewInit, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AsyncOperationDialogState } from '../../shared/async-operation-dialog-state.enum';
import { AsyncOperationDialogOptions } from '../../shared/async-operation-dialog-options';
import { AsyncTasksService, AsyncTaskStatus, pollAsyncTask } from '../../../../client/step-client-module';
import { catchError, switchMap } from 'rxjs/operators';
import { map, of, timer } from 'rxjs';
import { AsyncOperationDialogResult } from '../../shared/async-operation-dialog-result';
import { AsyncOperationCloseStatus } from '../../shared/async-operation-close-status.enum';
import { SafeHtml } from '@angular/platform-browser';
import { BaseModalWindowComponent } from '../../../basics/components/modal-window/base-modal-window.component';

@Component({
  selector: 'step-async-operation-dialog',
  templateUrl: './async-operation-dialog.component.html',
  styleUrls: ['./async-operation-dialog.component.scss'],
  host: {
    class: 'messages-view-dialog',
  },
  standalone: false,
})
export class AsyncOperationDialogComponent extends BaseModalWindowComponent implements AfterViewInit {
  private _asyncService = inject(AsyncTasksService);
  readonly _dialogData: AsyncOperationDialogOptions = inject<AsyncOperationDialogOptions>(MAT_DIALOG_DATA);

  readonly AsyncOperationDialogState = AsyncOperationDialogState;

  state: AsyncOperationDialogState = AsyncOperationDialogState.PROGRESS;
  progress: number = 0;

  successMessage: SafeHtml = '';
  errorMessage: SafeHtml = '';

  error?: AsyncTaskStatus | Error;
  operationStatus?: AsyncTaskStatus;

  @ViewChild('trackFocus')
  private trackFocus!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.performAnOperation();
  }

  cancel(): void {
    const result: AsyncOperationDialogResult = { closeStatus: AsyncOperationCloseStatus.NO_ACTION };
    this._dialogRef.close(result);
  }

  @HostListener('keydown.enter')
  closeOk(): void {
    if (this.state === AsyncOperationDialogState.PROGRESS) {
      return;
    }
    let result: AsyncOperationDialogResult;
    if (this.state === AsyncOperationDialogState.SUCCESS) {
      result = {
        closeStatus: AsyncOperationCloseStatus.SUCCESS,
        operationStatus: this.operationStatus,
      };
    } else {
      result = {
        closeStatus: AsyncOperationCloseStatus.ERROR,
        error: this.error,
      };
    }
    this._dialogRef.close(result);
  }

  override focusDialog(): void {
    this.trackFocus.nativeElement.focus();
  }

  @HostListener('window:keyup.esc')
  protected override closeByEsc() {
    if (this.state === AsyncOperationDialogState.PROGRESS) {
      return;
    }
    super.closeByEsc();
  }

  private performAnOperation(): void {
    this._dialogData
      .asyncOperation()
      .pipe(
        pollAsyncTask(this._asyncService, (progress) => {
          this.progress = progress * 100;
        }),
        map((result) => {
          if (result.error) {
            throw result;
          }
          return result;
        }),
        catchError((err) => {
          this.errorMessage = this._dialogData.errorMessage(err);
          this.error = err;
          this.switchState(AsyncOperationDialogState.ERROR);
          console.error(err);
          return of(undefined);
        }),
        // A small delay to show the last progress value
        switchMap((result) => timer(500).pipe(map(() => result))),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.successMessage = this._dialogData.successMessage(result);
        this.operationStatus = result;
        this.switchState(AsyncOperationDialogState.SUCCESS);
      });
  }

  private switchState(state: AsyncOperationDialogState): void {
    this.state = state;
    this.focusDialog();
  }
}
