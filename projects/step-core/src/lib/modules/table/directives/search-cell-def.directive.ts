import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[stepSearchCellDef]' })
export class SearchCellDefDirective {
  readonly template = inject(TemplateRef);
}
