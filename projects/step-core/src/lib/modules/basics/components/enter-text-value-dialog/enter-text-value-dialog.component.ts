import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EnterTextValueDialogData {
  title: string;
  value: string;
  confirmButtonLabel?: string;
  multiline?: boolean;
  subtitle?: string;
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

  protected readonly _dialogData = inject<EnterTextValueDialogData>(MAT_DIALOG_DATA);

  protected value: string = '';

  ngOnInit(): void {
    this.value = this._dialogData.value;
  }

  protected onSubmit(): void {
    this._dialogRef.close(this.value);
  }
}
