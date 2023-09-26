import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTreeNodeTemplate]',
})
export class TreeNodeTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
