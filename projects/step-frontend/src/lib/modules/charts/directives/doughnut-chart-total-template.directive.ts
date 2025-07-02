import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepDoughnutChartTotalTemplate]',
})
export class DoughnutChartTotalTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
