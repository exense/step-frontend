import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTreeNodeNameTemplate]',
  standalone: true,
})
export class TreeNodeNameTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
