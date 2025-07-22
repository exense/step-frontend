import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepAltExecutionTreeNodeAddon]',
  standalone: false,
})
export class AltExecutionTreeNodeAddonDirective {
  readonly templateRef = inject(TemplateRef);
}
