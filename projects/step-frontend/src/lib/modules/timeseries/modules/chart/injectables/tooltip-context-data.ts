import * as uPlot from 'uplot';
import { TSChartSeries } from '../types/ts-chart-series';

export interface TooltipContextData {
  idx?: number;
  idY?: number;
  xValues: number[];
  series: TSChartSeries[];
  chartRef: uPlot;
}
