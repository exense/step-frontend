import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepEditableLabelTemplate]',
})
export class EditableLabelTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
