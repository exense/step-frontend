import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Execution } from '@exense/step-core';
import { Observable } from 'rxjs';
import {
  BulkExecutionStopConfirmationData,
  BulkExecutionStopConfirmationResult,
  ExecutionStopConfirmationComponent,
  ExecutionStopConfirmationData,
} from '../components/execution-stop-confirmation/execution-stop-confirmation.component';

const STOP_CONFIRMATION_DIALOG_LAYOUT = {
  panelClass: 'step-compact-confirmation-dialog',
  width: '572px',
  maxWidth: 'calc(100vw - 32px)',
};

@Injectable({ providedIn: 'root' })
export class ExecutionStopConfirmationService {
  private readonly _matDialog = inject(MatDialog);

  confirmStop(execution: Execution): Observable<string | undefined> {
    return this._matDialog
      .open<ExecutionStopConfirmationComponent, ExecutionStopConfirmationData, string>(
        ExecutionStopConfirmationComponent,
        {
          ...STOP_CONFIRMATION_DIALOG_LAYOUT,
          data: { execution },
        },
      )
      .afterClosed();
  }

  confirmBulkStop(
    data: BulkExecutionStopConfirmationData,
  ): Observable<BulkExecutionStopConfirmationResult | undefined> {
    return this._matDialog
      .open<
        ExecutionStopConfirmationComponent,
        BulkExecutionStopConfirmationData,
        BulkExecutionStopConfirmationResult
      >(ExecutionStopConfirmationComponent, { ...STOP_CONFIRMATION_DIALOG_LAYOUT, data })
      .afterClosed();
  }
}
