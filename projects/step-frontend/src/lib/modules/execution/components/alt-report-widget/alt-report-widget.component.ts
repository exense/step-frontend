import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'step-alt-report-widget',
  templateUrl: './alt-report-widget.component.html',
  styleUrl: './alt-report-widget.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.title]': 'null',
    '[class.overflow-content]': 'applyOverflow()',
  },
  standalone: false,
})
export class AltReportWidgetComponent {
  /** @Input() **/
  readonly title = input<string>();

  /** @Input() **/
  readonly applyOverflow = input<boolean>(false);
}
