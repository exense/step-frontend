import { Directive, ElementRef, inject, input } from '@angular/core';
import { RowInfo } from '../types/row-info.interface';

@Directive({
  selector: 'tr[stepRow]',
})
export class RowDirective {
  private _elRef = inject<ElementRef<HTMLTableRowElement>>(ElementRef, { self: true });
  readonly data = input<unknown>(undefined, { alias: 'stepRow' });

  getRowInfo(): RowInfo {
    const elRef = this._elRef;
    const data = this.data();
    return { elRef, data };
  }
}
