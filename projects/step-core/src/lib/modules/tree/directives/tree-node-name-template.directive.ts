import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTreeNodeNameTemplate]',
})
export class TreeNodeNameTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
