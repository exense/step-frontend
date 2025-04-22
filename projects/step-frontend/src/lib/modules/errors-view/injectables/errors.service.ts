import { inject, Injectable } from '@angular/core';
import { ErrorMessageHandlerStrategy } from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsViewStateService } from './errors-view-state.service';
import { ErrorViewDialogComponent } from '../components/error-view-dialog/error-view-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService implements ErrorMessageHandlerStrategy {
  private _madDialog = inject(MatDialog);
  private _errorState = inject(ErrorsViewStateService);

  private isDialogOpened = false;

  showError(message: string): void {
    this._errorState.addError(message);
    this.openErrorsDialog();
  }

  openErrorsDialog(): void {
    if (this.isDialogOpened) {
      return;
    }
    this.isDialogOpened = true;
    this._madDialog
      .open(ErrorViewDialogComponent)
      .afterClosed()
      .subscribe(() => {
        this._errorState.dismissAll();
        this.isDialogOpened = false;
      });
  }
}
