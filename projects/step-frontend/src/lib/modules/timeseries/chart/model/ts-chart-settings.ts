import uPlot from '../../uplot/uPlot';
import Axis = uPlot.Axis;
import Series = uPlot.Series;
import Cursor = uPlot.Cursor;

export interface TSChartSettings {
  title: string;
  xValues: number[]; // in seconds
  cursor?: Cursor;
  series: TSChartSeries[];
  autoResize?: boolean;
  axes?: Axis[];
  showLegend: boolean;
}

export interface TSChartSeries extends Series {
  data: number[];
  id?: string;
}
