import { Directive, inject, input, TemplateRef } from '@angular/core';
import { SplitAreaSizeType } from '../../split';

@Directive({
  selector: '[stepPlanTreeRightPanel]',
})
export class PlanTreeRightPanelDirective {
  readonly _templateRef = inject(TemplateRef);
  readonly sizeType = input<SplitAreaSizeType | ''>('', { alias: 'stepPlanTreeRightPanel' });
}
