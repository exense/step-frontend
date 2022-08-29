import uPlot from '../../uplot/uPlot';
import { Axis, Cursor, Scale, Series } from 'uplot';

export interface TSChartSettings {
  title: string;
  xValues: number[]; // in milliseconds
  cursor?: Cursor; // cursor related settings and events
  series: TSChartSeries[];
  scales?: Scale[];
  autoResize?: boolean; // autoresize on window size change
  axes?: Axis[];
  showLegend?: boolean; // show legend behind the chart
  yScaleUnit?: string; // the unit which will be displayed along with the Y axis.
}

export interface TSChartSeries extends Series {
  data: (number | null)[];
  id: string;
}
