import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepStackViewItemContent]',
})
export class StackViewItemContentDirective {
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
