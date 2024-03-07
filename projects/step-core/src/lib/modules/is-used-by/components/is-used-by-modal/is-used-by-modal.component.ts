import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IsUsedByDialogData, StepBasicsModule } from '../../../basics/step-basics.module';
import { IsUsedByListComponent } from '../is-used-by-list/is-used-by-list.component';

@Component({
  selector: 'step-is-used-by-modal',
  templateUrl: './is-used-by-modal.component.html',
  standalone: true,
  imports: [StepBasicsModule, IsUsedByListComponent],
})
export class IsUsedByModalComponent {
  constructor(
    public _dialogRef: MatDialogRef<IsUsedByModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: IsUsedByDialogData,
  ) {}
}
