import { Component, computed, effect, input } from '@angular/core';
import { DashboardItem, TimeRange } from '@exense/step-core';
import { v4 } from 'uuid';
import { TimeSeriesContext } from '../../../timeseries/modules/_common';

@Component({
  selector: 'step-alt-report-response-time-chart',
  templateUrl: './alt-report-response-time-chart.component.html',
  styleUrl: './alt-report-response-time-chart.component.scss',
})
export class AltReportResponseTimeChartComponent {
  private chartId = v4();

  /** @Input() **/
  executionId = input.required<string>();

  /** @Input() **/
  timeRange = input<TimeRange>();

  readonly chartItem = computed(() => this.createChartItem(this.executionId()));

  protected chartContext?: TimeSeriesContext;

  private rangeChangedEffect = effect(() => {
    const timeRange = this.timeRange()!;
    if (!timeRange) {
      return;
    }

    // TODO await for SED-3042 Decommissioned legacy dashboards
    if (!this.chartContext) {
      this.chartContext = this.createContext(timeRange);
    } else {
      this.chartContext.updateFullRange(timeRange);
    }
  });

  private createContext(timeRange: TimeRange): TimeSeriesContext {
    return new TimeSeriesContext({
      id: this.chartId,
      grouping: ['name'],
      timeRange,
      dashlets: [],
    });
  }

  private createChartItem(executionId: string): DashboardItem {
    return {
      id: this.chartId,
      name: 'Response time',
      type: 'CHART',
      size: 100,
      metricKey: 'response-time',
      inheritGlobalFilters: false,
      inheritGlobalGrouping: false,
      readonlyAggregate: false,
      readonlyGrouping: false,
      grouping: ['name'],
      filters: [{ type: 'EXECUTION', exactMatch: true, textValues: [executionId], attribute: 'eId' }],
      attributes: [],
      chartSettings: {
        primaryAxes: {
          aggregation: 'AVG',
          unit: 'ms',
          displayType: 'LINE',
          colorizationType: 'STROKE',
          renderingSettings: {},
        },
      },
    };
  }
}
