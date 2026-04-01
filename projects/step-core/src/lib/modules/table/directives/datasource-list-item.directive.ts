import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepDatasourceListItem]',
})
export class DatasourceListItemDirective {
  readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
