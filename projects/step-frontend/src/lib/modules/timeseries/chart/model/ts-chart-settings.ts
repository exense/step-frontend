import uPlot from '../../uplot/uPlot';
import { Axis, Cursor, Series } from 'uplot';

export interface TSChartSettings {
  title: string;
  xValues: number[]; // in seconds
  cursor?: Cursor;
  series: TSChartSeries[];
  autoResize?: boolean;
  axes?: Axis[];
  showLegend?: boolean;
}

export interface TSChartSeries extends Series {
  data: (number | null)[];
  id: string;
}
