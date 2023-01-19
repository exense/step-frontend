import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE } from '../angularjs/directives/simple-line-chart-wrapper.directive';

@Directive({
  selector: 'step-simple-line-chart',
})
export class SimpleLineChartDirective extends UpgradeComponent {
  @Input() handle!: any;

  @Input() chartId!: string;

  constructor(_elementRef: ElementRef, _injector: Injector) {
    super(SIMPLE_LINE_CHART_WRAPPER_DIRECTIVE, _elementRef, _injector);
  }
}
