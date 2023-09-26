import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WizardDialogData } from '../../types/wizard-dialog-data.interface';
import { a1Promise2Observable, DialogsService } from '../../../../shared';
import { map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'step-wizard-dialog',
  templateUrl: './wizard-dialog.component.html',
  styleUrls: ['./wizard-dialog.component.scss'],
})
export class WizardDialogComponent {
  private _dialogRef = inject(MatDialogRef);
  private _dialogs = inject(DialogsService);
  readonly _data = inject<WizardDialogData<unknown>>(MAT_DIALOG_DATA);

  onFinish(): void {
    this._dialogRef.close();
  }

  onClose(): void {
    a1Promise2Observable(this._dialogs.showWarning('Are you sure to close the wizard dialog?'))
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          this._dialogRef.close();
        }
      });
  }
}
