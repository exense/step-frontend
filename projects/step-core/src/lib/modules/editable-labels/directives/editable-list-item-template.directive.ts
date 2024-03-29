import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepEditableListItemTemplate]',
  standalone: true,
})
export class EditableListItemTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
