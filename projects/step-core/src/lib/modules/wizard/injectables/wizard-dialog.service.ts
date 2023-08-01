import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WizardDialogData } from '../types/wizard-dialog-data.interface';
import { WizardDialogComponent } from '../components/wizard-dialog/wizard-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class WizardDialogService {
  private _matDialog = inject(MatDialog);

  startWizard<T extends Record<string, any>>(title: string, steps: string[], initialModel?: T): void {
    initialModel = initialModel ?? ({} as T);
    const data: WizardDialogData<T> = { steps, title, initialModel };
    this._matDialog.open(WizardDialogComponent, {
      data,
      disableClose: true,
      width: '70rem',
    });
  }
}
