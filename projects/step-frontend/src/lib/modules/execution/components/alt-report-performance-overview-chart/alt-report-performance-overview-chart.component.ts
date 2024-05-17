import { Component, computed, input } from '@angular/core';
import { TimeRange } from '@exense/step-core';
import { FilterBarItem, FilterBarItemType, StandaloneChartConfig } from '../../../timeseries/time-series.module';

@Component({
  selector: 'step-alt-report-performance-overview-chart',
  templateUrl: './alt-report-performance-overview-chart.component.html',
  styleUrl: './alt-report-performance-overview-chart.component.scss',
})
export class AltReportPerformanceOverviewChartComponent {
  protected readonly chartConfig: StandaloneChartConfig = {
    showTooltip: true,
    showLegend: true,
    showYAxes: true,
    showTimeAxes: true,
    showCursor: true,
    zoomEnabled: false,
    primaryAxesUnit: 'ms',
    colorizationType: 'FILL',
    height: 300,
  };

  protected readonly metricKey = 'response-time';

  /** @Input() **/
  executionId = input.required<string>();

  /** @Input() **/
  timeRange = input<TimeRange>();

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
}
