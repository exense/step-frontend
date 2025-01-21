import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTreeNodeTemplate]',
  standalone: true,
})
export class TreeNodeTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
