import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTreeNodeDetailsTemplate]',
})
export class TreeNodeDetailsTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
