import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepTablePaginatorContent]',
})
export class TablePaginatorContentDirective {
  public readonly templateRef = inject(TemplateRef);
}
