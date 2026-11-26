import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AsyncTasksService,
  AsyncTaskStatus,
  AuthService,
  BulkSelectionType,
  Execution,
  ExecutionNamePipe,
  pollAsyncTask,
  StepBasicsModule,
} from '@exense/step-core';
import { catchError, defaultIfEmpty, defer, map, Observable, of, take } from 'rxjs';

export interface ExecutionStopConfirmationData {
  execution: Execution;
}

export interface BulkExecutionStopConfirmationData {
  selectionType: BulkSelectionType;
  preview: () => Observable<AsyncTaskStatus>;
}

export type BulkExecutionStopConfirmationResult = string | { previewError: Error | AsyncTaskStatus };

type StopConfirmationState =
  | { kind: 'progress' }
  | { kind: 'confirmation'; message?: string }
  | { kind: 'error'; message: string; error: Error | AsyncTaskStatus };

@Component({
  selector: 'step-execution-stop-confirmation',
  templateUrl: './execution-stop-confirmation.component.html',
  standalone: true,
  imports: [StepBasicsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionStopConfirmationComponent implements OnInit {
  private readonly _data = inject<ExecutionStopConfirmationData | BulkExecutionStopConfirmationData>(MAT_DIALOG_DATA);
  private readonly _dialogRef =
    inject<MatDialogRef<ExecutionStopConfirmationComponent, BulkExecutionStopConfirmationResult>>(MatDialogRef);
  private readonly _asyncTasks = inject(AsyncTasksService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _formBuilder = inject(FormBuilder).nonNullable;
  private readonly authContext = toSignal(inject(AuthService).context$.pipe(take(1)));

  protected readonly title =
    'execution' in this._data
      ? `Are you sure you want to stop Execution ${ExecutionNamePipe.transform(this._data.execution)}?`
      : 'Confirm Stop';
  protected readonly reason = this._formBuilder.control(this.defaultReason(), Validators.required);
  protected readonly progress = signal(0);
  protected readonly state = signal<StopConfirmationState>(
    'execution' in this._data ? { kind: 'confirmation' } : { kind: 'progress' },
  );

  ngOnInit(): void {
    if ('execution' in this._data) {
      return;
    }
    const { preview, selectionType } = this._data;
    defer(preview)
      .pipe(
        pollAsyncTask(this._asyncTasks, (progress) => this.progress.set(progress * 100)),
        defaultIfEmpty(undefined),
        map((status): StopConfirmationState => {
          if (!status) {
            throw new Error('The stop preview returned no status.');
          }
          if (status.error) {
            return { kind: 'error', message: `Error: ${status.error}`, error: status };
          }
          return { kind: 'confirmation', message: this.previewMessage(selectionType, status.result?.count) };
        }),
        catchError((error: Error) =>
          of<StopConfirmationState>({ kind: 'error', message: 'An error occurred while stop operation', error }),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((state) => this.state.set(state));
  }

  protected confirm(): void {
    if (this.reason.invalid) {
      this.reason.markAsTouched();
      return;
    }
    this._dialogRef.close(this.reason.value);
  }

  protected acknowledgeError(error: Error | AsyncTaskStatus): void {
    this._dialogRef.close({ previewError: error });
  }

  private defaultReason(): string {
    const userID = this.authContext()?.userID;
    return userID?.trim() ? `Interrupted by ${userID}` : 'interrupted';
  }

  private previewMessage(selectionType: BulkSelectionType, count: unknown): string {
    if (typeof count !== 'number') {
      return 'Do you want to stop all selected items?';
    }
    const scope = selectionType === BulkSelectionType.ALL ? 'all' : 'the';
    return `Do you want to stop ${scope} ${count} selected item(s)?`;
  }
}
