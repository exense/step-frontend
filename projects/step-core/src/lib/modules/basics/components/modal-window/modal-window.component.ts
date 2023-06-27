import { Component, inject, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss'],
})
export class ModalWindowComponent {
  readonly _dialogRef = inject(MatDialogRef);

  @Input() showSpinner = false;
  @Input() title = '';
}
