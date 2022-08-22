import uPlot from '../../uplot/uPlot';
import { Axis, Cursor, Series } from 'uplot';
import Select = uPlot.Select;

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
