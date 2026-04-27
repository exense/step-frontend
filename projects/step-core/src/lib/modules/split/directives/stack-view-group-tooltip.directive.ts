import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepStackViewGroupTooltip]',
})
export class StackViewGroupTooltipDirective {
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
