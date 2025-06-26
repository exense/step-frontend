import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { COMMON_IMPORTS } from '../../../_common';

/**
 * This component represents a visual effect for a loading chart.
 */
@Component({
  selector: 'step-chart-skeleton',
  templateUrl: './chart-skeleton.component.html',
  styleUrls: ['./chart-skeleton.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSkeletonComponent {
  @Input() height: number = 300;
}
