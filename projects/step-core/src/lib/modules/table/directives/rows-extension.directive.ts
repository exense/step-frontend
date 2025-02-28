import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepRowsExtension]',
})
export class RowsExtensionDirective {
  readonly template = inject<TemplateRef<any>>(TemplateRef);
}
