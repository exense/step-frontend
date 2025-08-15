import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepAutoShrankEmptyValueTemplate]',
})
export class AutoShrankEmptyValueTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
