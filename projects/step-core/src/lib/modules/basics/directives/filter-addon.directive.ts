import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepFilterAddon]',
})
export class FilterAddonDirective {
  readonly _templateRef = inject<TemplateRef<any>>(TemplateRef);
}
