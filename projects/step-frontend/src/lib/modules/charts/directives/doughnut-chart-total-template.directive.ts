import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[stepDoughnutChartTotalTemplate]',
  standalone: true,
})
export class DoughnutChartTotalTemplateDirective {
  readonly templateRef = inject(TemplateRef);
}
