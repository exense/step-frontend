import { Axis, Cursor, Scale, Series } from 'uplot';
import { TsTooltipOptions } from './ts-tooltip-options';

export interface TSChartSettings {
  title: string;
  xValues: number[]; // in milliseconds
  cursor?: Cursor; // cursor related settings and events
  showExecutionsLinks?: boolean;
  series: TSChartSeries[];
  scales?: Scale[];
  autoResize?: boolean; // autoresize on window size change
  axes: Axis[];
  tooltipOptions: TsTooltipOptions;
}

export interface TSChartSeries extends Series {
  id: string;
  data: (number | null | undefined)[];
  metadata?: any[];
  legendName: string;
}
