import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepArtefactInlineDetailsHeader]',
  standalone: true,
})
export class ArtefactInlineDetailsHeaderDirective {
  readonly templateRef = inject(TemplateRef);
}
