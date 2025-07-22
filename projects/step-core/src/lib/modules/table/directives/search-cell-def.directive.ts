import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepSearchCellDef]',
  standalone: false,
})
export class SearchCellDefDirective {
  readonly template = inject(TemplateRef);
}
