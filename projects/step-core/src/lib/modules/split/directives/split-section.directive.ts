import { Directive, inject, input, TemplateRef } from '@angular/core';
import { SplitAreaSizeType } from '@exense/step-core';

@Directive({
  selector: '[stepSplitSection]',
})
export class SplitSectionDirective {
  readonly _templateRef = inject(TemplateRef);
  readonly header = input.required<string>({ alias: 'stepSplitSection' });
  readonly sizeType = input<SplitAreaSizeType>('pixel', { alias: 'stepSplitSectionSizeType' });
  readonly padding = input<string | undefined>(undefined, { alias: 'stepSplitSectionPadding' });
}
