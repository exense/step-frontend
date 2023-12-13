import { Component, HostBinding, inject, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss'],
})
export class ModalWindowComponent {
  /**
   * This component has an input "title" which also works as assignment
   * of native html title attribute.
   * It might cause some negative effects, when modal title appears on hover.
   * This binding was added to negate this negative effect.
   */
  @HostBinding('attr.title') private nativeTitle = null;

  @Input() showSpinner?: boolean;
  @Input() title = '';
  @Input() hideButtonsSection = false;

  protected _dialogRef = inject(MatDialogRef);
}
