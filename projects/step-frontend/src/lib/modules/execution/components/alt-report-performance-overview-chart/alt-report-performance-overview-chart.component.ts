import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { TimeRange } from '@exense/step-core';
import { FilterBarItem, FilterBarItemType, StandaloneChartConfig } from '../../../timeseries/time-series.module';
import { ViewMode } from '../../shared/view-mode';

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
    showTimeAxes: true,
    showCursor: true,
    zoomEnabled: false,
    primaryAxesUnit: 'ms',
    colorizationType: 'FILL',
    height: 238,
  };

  protected readonly metricKey = 'response-time';

  /** @Input() **/
  mode = input<ViewMode>(ViewMode.VIEW);

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
  protected readonly ViewMode = ViewMode;
}
