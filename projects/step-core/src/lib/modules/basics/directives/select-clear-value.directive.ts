import { Directive, input } from '@angular/core';

const CLEAR_INTERNAL_VALUE = Symbol('Clear value');

@Directive({
  selector: '[stepSelectClearValue]',
  standalone: true,
})
export class SelectClearValueDirective {
  readonly useClear = input(true);
  readonly clearLabel = input('clear');
  readonly clearValue = input<null | undefined>(undefined);
  readonly CLEAR_INTERNAL_VALUE = CLEAR_INTERNAL_VALUE;
}
