import { ChangeDetectionStrategy, Component, input, Input, ViewEncapsulation } from '@angular/core';
import { COMMON_IMPORTS } from '../../../_common';

/**
 * This component represents a visual effect for a loading chart.
 */
@Component({
  selector: 'step-chart-skeleton',
  templateUrl: './chart-skeleton.component.html',
  styleUrls: ['./chart-skeleton.component.scss'],
  host: {
    '[class.fill-container]': 'fillContainer()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [COMMON_IMPORTS],
})
export class ChartSkeletonComponent {
  readonly height = input<number>(300);
  readonly noPadding = input<boolean>(false);
  readonly showLegend = input<boolean>(false);
  readonly fillContainer = input<boolean>(false);
}
