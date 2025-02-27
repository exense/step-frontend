import { ElementRef } from '@angular/core';

export interface RowInfo {
  readonly elRef: ElementRef<HTMLTableRowElement>;
  readonly data: unknown;
}
