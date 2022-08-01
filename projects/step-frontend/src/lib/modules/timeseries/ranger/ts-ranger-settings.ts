import { TSChartSeries } from '../chart/model/ts-chart-settings';
import { TSTimeRange } from '../chart/model/ts-time-range';

export interface TSRangerSettings {
  xValues: number[];
  series: TSChartSeries[];
  selection?: TSTimeRange;
}
