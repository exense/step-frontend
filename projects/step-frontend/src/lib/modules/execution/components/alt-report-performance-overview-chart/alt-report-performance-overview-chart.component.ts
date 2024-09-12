import { Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';
import { TimeRange } from '@exense/step-core';
import { FilterBarItem, FilterBarItemType, StandaloneChartConfig } from '../../../timeseries/time-series.module';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';

@Component({
  selector: 'step-alt-report-performance-overview-chart',
  templateUrl: './alt-report-performance-overview-chart.component.html',
  styleUrl: './alt-report-performance-overview-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltReportPerformanceOverviewChartComponent {
  protected readonly chartConfig: StandaloneChartConfig = {
    showTooltip: true,
    showLegend: true,
    showYAxes: true,
    showZAxes: true,
    showTimeAxes: true,
    showCursor: true,
    zoomEnabled: true,
    primaryAxesUnit: 'ms',
    colorizationType: 'STROKE',
    height: 238,
  };

  protected readonly metricKey = 'response-time';
  protected readonly _mode = inject(VIEW_MODE);

  /** @Input() **/
  isFullRange = input<boolean>(true);

  /** @Input() **/
  executionId = input.required<string>();

  /** @Input() **/
  timeRange = input<TimeRange>();

  /** @Output() **/
  timeRangeChange = output<TimeRange>();

  /** @Output() **/
  fullRange = output();

  chartFilters = computed(() => {
    const executionId = this.executionId();
    if (!executionId) {
      return [];
    }

    return [
      {
        attributeName: 'eId',
        label: 'Execution',
        isLocked: true,
        exactMatch: true,
        searchEntities: [{ searchValue: executionId }],
        type: FilterBarItemType.EXECUTION,
      },
    ] as FilterBarItem[];
  });
  protected readonly ViewMode = ViewMode;
}