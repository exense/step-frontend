import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTabTemplate]',
})
export class TabTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
