import { Directive, inject, input, TemplateRef } from '@angular/core';
import { SplitAreaSizeType } from '../../split';

@Directive({
  selector: '[stepPlanTreeRightPanel]',
})
export class PlanTreeRightPanelDirective {
  readonly _templateRef = inject(TemplateRef);
  readonly header = input.required<string>({ alias: 'stepPlanTreeRightPanel' });
  readonly sizeType = input<SplitAreaSizeType>('pixel', { alias: 'stepPlanTreeRightPanelSizeType' });
}
