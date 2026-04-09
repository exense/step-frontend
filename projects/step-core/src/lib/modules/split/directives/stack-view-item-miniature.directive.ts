import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepStackViewItemMiniature]',
})
export class StackViewItemMiniatureDirective {
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
