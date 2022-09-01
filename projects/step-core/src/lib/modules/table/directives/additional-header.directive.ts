import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepAdditionalHeader]',
})
export class AdditionalHeaderDirective {
  constructor(public template: TemplateRef<any>) {}
}
