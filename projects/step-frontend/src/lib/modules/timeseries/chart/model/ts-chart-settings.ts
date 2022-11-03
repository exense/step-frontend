import { Axis, Cursor, Scale, Series } from 'uplot';
import { TsTooltipOptions } from './ts-tooltip-options';

export interface TSChartSettings {
  title: string;
  xValues: number[]; // in milliseconds
  cursor?: Cursor; // cursor related settings and events
  series: TSChartSeries[];
  scales?: Scale[];
  autoResize?: boolean; // autoresize on window size change
  axes: Axis[];
  showLegend?: boolean; // show legend behind the chart
  tooltipOptions: TsTooltipOptions;
}

export interface TSChartSeries extends Series {
  id: string;
  data: (number | null | undefined)[];
  legendName: string;
}
