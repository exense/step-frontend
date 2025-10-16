import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepSearchFieldAddon]',
})
export class SearchFieldAddonDirective {
  readonly _templateRef = inject(TemplateRef);
}
