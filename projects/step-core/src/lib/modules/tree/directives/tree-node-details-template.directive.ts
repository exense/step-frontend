import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTreeNodeDetailsTemplate]',
  standalone: true,
})
export class TreeNodeDetailsTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
