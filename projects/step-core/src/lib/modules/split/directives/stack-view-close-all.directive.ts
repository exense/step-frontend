import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepStackViewCloseAll]',
})
export class StackViewCloseAllDirective {
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
