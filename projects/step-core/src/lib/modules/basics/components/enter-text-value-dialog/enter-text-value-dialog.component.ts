import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EnterTextValueDialogData {
  title: string;
  value: string;
  multiline?: boolean;
}

export type EnterTextValueDialogResult = string | undefined;

@Component({
  selector: 'step-enter-text-value-dialog',
  templateUrl: './enter-text-value-dialog.component.html',
  styleUrls: ['./enter-text-value-dialog.component.scss'],
  standalone: false,
})
export class EnterTextValueDialogComponent implements OnInit {
  private _dialogRef = inject<MatDialogRef<EnterTextValueDialogComponent, EnterTextValueDialogResult>>(MatDialogRef);

  readonly dialogData = inject<EnterTextValueDialogData>(MAT_DIALOG_DATA);

  value: string = '';

  ngOnInit(): void {
    this.value = this.dialogData.value;
  }

  onSubmit(): void {
    this._dialogRef.close(this.value);
  }
}
