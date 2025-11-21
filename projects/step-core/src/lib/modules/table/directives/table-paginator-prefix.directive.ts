import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTablePaginatorPrefix]',
  standalone: false,
})
export class TablePaginatorPrefixDirective {
  public readonly templateRef = inject(TemplateRef);
}
