import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTabTemplate]',
  standalone: true,
})
export class TabTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
