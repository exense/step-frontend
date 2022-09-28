import { Directive, TemplateRef, Input } from '@angular/core';

@Directive({
  selector: '[stepAdditionalHeader]',
})
export class AdditionalHeaderDirective {
  @Input('stepAdditionalHeader') headerGroupId?: string;

  constructor(public template: TemplateRef<any>) {}
}
