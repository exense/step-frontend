import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepEditableListItemTemplate]',
})
export class EditableListItemTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
