import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepAutoShrinkEmptyValueTemplate]',
})
export class AutoShrinkEmptyValueTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
