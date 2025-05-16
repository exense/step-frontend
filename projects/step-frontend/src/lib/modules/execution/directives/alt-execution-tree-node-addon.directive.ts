import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepAltExecutionTreeNodeAddon]',
})
export class AltExecutionTreeNodeAddonDirective {
  readonly templateRef = inject(TemplateRef);
}
