import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepStackViewItemTitle]',
})
export class StackViewItemTitleDirective {
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
