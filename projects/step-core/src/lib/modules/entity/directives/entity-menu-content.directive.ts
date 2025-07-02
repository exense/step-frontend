import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[stepEntityMenuContent]',
  standalone: false,
})
export class EntityMenuContentDirective {
  readonly templateRef = inject(TemplateRef);
}
