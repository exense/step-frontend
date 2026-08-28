import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepGridLayoutExternalTab]',
})
export class GridLayoutExternalTabDirective {
  readonly _templateRef = inject(TemplateRef);
}
