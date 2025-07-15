import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepArtefactInlineDetailsHeader]',
})
export class ArtefactInlineDetailsHeaderDirective {
  readonly templateRef = inject(TemplateRef);
}
