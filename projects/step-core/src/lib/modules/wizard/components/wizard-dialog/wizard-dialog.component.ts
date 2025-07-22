import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WizardDialogData } from '../../types/wizard-dialog-data.interface';
import { DialogsService, ModalWindowComponent } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-wizard-dialog',
  templateUrl: './wizard-dialog.component.html',
  styleUrls: ['./wizard-dialog.component.scss'],
  standalone: false,
})
export class WizardDialogComponent {
  @ViewChild(ModalWindowComponent, { static: true })
  private modalWindow!: ModalWindowComponent;

  private _dialogRef = inject(MatDialogRef);
  private _dialogs = inject(DialogsService);
  readonly _data = inject<WizardDialogData<unknown>>(MAT_DIALOG_DATA);

  onFinish(): void {
    this._dialogRef.close();
  }

  @HostListener('window:keyup.esc')
  onClose(): void {
    if (!this.modalWindow.isTopDialog()) {
      return;
    }
    this._dialogs.showWarning('Are you sure to close the wizard dialog?').subscribe((isConfirmed) => {
      if (isConfirmed) {
        this._dialogRef.close();
      }
    });
  }
}
