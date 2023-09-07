import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IsUsedByDialogData } from '../../modules/basics/step-basics.module';

@Component({
  selector: 'step-is-used-by-modal',
  templateUrl: './is-used-by-modal.component.html',
  styleUrls: ['./is-used-by-modal.component.scss'],
})
export class IsUsedByModalComponent {
  constructor(
    public _dialogRef: MatDialogRef<IsUsedByModalComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: IsUsedByDialogData
  ) {}
}
