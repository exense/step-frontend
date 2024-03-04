import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepEditableLabelTemplate]',
  standalone: true,
})
export class EditableLabelTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
