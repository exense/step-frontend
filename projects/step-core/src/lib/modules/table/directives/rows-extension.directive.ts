import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepRowsExtension]',
  standalone: false,
})
export class RowsExtensionDirective {
  readonly template = inject<TemplateRef<any>>(TemplateRef);
}
