import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[stepEntityMenuContent]',
})
export class EntityMenuContentDirective {
  readonly templateRef = inject(TemplateRef);
}
