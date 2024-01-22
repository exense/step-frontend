import { TSChartSeries } from '../chart/model/ts-chart-settings';
import { TimeRange } from '@exense/step-core';

export interface TSRangerSettings {
  xValues: number[];
  series: TSChartSeries[];
  selection?: TimeRange;
}
