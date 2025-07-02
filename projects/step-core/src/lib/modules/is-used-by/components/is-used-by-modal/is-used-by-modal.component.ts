import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IsUsedByDialogData, StepBasicsModule } from '../../../basics/step-basics.module';
import { IsUsedByListComponent } from '../is-used-by-list/is-used-by-list.component';

@Component({
  selector: 'step-is-used-by-modal',
  templateUrl: './is-used-by-modal.component.html',
  imports: [StepBasicsModule, IsUsedByListComponent],
})
export class IsUsedByModalComponent {
  _dialogRef = inject<MatDialogRef<IsUsedByModalComponent>>(MatDialogRef);
  _data = inject<IsUsedByDialogData>(MAT_DIALOG_DATA);
}
