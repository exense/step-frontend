import { Component, HostBinding, Input, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'step-alt-report-widget',
  templateUrl: './alt-report-widget.component.html',
  styleUrl: './alt-report-widget.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltReportWidgetComponent {
  /** @Input() **/
  title = input<string>();

  @HostBinding('class.overflow-content')
  @Input()
  applyOverflow = false;
}
