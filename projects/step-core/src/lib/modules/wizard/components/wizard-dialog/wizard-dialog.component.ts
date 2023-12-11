import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogsService } from '../../../../shared';
import { WizardDialogData } from '../../types/wizard-dialog-data.interface';

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
    this._dialogs.showWarning('Are you sure to close the wizard dialog?').subscribe((isConfirmed) => {
      if (isConfirmed) {
        this._dialogRef.close();
      }
    });
  }
}
