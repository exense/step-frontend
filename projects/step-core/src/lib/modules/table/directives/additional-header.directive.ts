import { Directive, TemplateRef, Input, inject } from '@angular/core';

@Directive({
  selector: '[stepAdditionalHeader]',
})
export class AdditionalHeaderDirective {
  readonly template = inject<TemplateRef<any>>(TemplateRef);
  @Input('stepAdditionalHeader') headerGroupId?: string;
}
