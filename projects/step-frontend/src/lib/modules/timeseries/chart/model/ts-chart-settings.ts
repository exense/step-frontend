import uPlot from '../../uplot/uPlot';
import { Axis, Cursor, Scale, Series } from 'uplot';
import Select = uPlot.Select;

export interface TSChartSettings {
  title: string;
  xValues: number[]; // in seconds
  cursor?: Cursor;
  series: TSChartSeries[];
  scales?: Scale[];
  autoResize?: boolean;
  axes?: Axis[];
  showLegend?: boolean;
  yScaleUnit?: string;
}

export interface TSChartSeries extends Series {
  data: (number | null)[];
  id: string;
}
