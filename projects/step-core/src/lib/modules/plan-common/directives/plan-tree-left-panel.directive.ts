import { Directive, inject, input, TemplateRef } from '@angular/core';
import { SplitAreaSizeType } from '../../split';

@Directive({
  selector: '[stepPlanTreeLeftPanel]',
})
export class PlanTreeLeftPanelDirective {
  readonly _templateRef = inject(TemplateRef);
  readonly header = input.required<string>({ alias: 'stepPlanTreeLeftPanel' });
  readonly sizeType = input<SplitAreaSizeType>('pixel', { alias: 'stepPlanTreeLeftPanelSizeType' });
}
