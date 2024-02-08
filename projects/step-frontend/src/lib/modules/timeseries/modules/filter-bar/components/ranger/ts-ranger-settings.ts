import { TSChartSeries } from '../../../chart';
import { TimeRange } from '@exense/step-core';

export interface TSRangerSettings {
  xValues: number[];
  series: TSChartSeries[];
  selection?: TimeRange;
}
