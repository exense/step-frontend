import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';
import { REPORT_NODE_WRAPPER } from '../angularjs/reportnode-wrapper';

@Directive({
  selector: 'step-report-node',
})
export class ReportNodeDirective extends UpgradeComponent {
  @Input() id?: string;
  @Input() showArtefact?: boolean;

  constructor(_el: ElementRef, _injector: Injector) {
    super(REPORT_NODE_WRAPPER, _el, _injector);
  }
}
