import * as uPlot from 'uplot';
import { TSChartSeries } from '../types/ts-chart-series';
import { TimeSeriesChartComponent } from '../components/time-series-chart/time-series-chart.component';

export interface TooltipContextData {
  idx?: number; // index of X axes
  idY?: number; // y value
  xValues: number[];
  series: TSChartSeries[];
  chartRef: uPlot;
  parentRef: TimeSeriesChartComponent;
}
