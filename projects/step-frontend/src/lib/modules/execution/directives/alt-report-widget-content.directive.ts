import { Directive } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/overlay';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'step-alt-report-widget-content',
  hostDirectives: [CdkScrollable],
  standalone: true,
})
export class AltReportWidgetContentDirective {}
