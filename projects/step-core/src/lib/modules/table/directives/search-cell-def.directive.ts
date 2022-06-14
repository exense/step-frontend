import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[stepSearchCellDef]' })
export class SearchCellDefDirective {
  constructor(public template: TemplateRef<any>) {}
}
