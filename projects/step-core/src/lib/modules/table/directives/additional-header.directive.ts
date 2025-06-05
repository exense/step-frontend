import { Directive, TemplateRef, Input, inject } from '@angular/core';
import { v4 } from 'uuid';

@Directive({
  selector: '[stepAdditionalHeader]',
  standalone: false,
})
export class AdditionalHeaderDirective {
  readonly headerId = v4();
  readonly template = inject<TemplateRef<any>>(TemplateRef);
  @Input('stepAdditionalHeader') headerGroupId?: string;
}
