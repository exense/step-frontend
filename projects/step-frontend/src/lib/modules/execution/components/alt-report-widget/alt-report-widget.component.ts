import { Component, computed, contentChild, input, ViewEncapsulation } from '@angular/core';
import { AltReportWidgetTitleDirective } from '../../directives/alt-report-widget-title.directive';

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
  private readonly titleDirective = contentChild(AltReportWidgetTitleDirective);
  protected readonly hasTitleLayout = computed(() => {
    const titleDirective = this.titleDirective();
    return !!titleDirective;
  });

  /** @Input() **/
  readonly title = input<string>();

  /** @Input() **/
  readonly applyOverflow = input<boolean>(false);
}
