import { Directive, HostListener, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Directive({
  selector: '[step-dialog-close]',
})
export class DialogCloseDirective {
  private _dialogRef = inject(MatDialogRef);

  @HostListener('click')
  onClick(): void {
    this._dialogRef.close(undefined);
  }
}
