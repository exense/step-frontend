import { Axis, Cursor, Hooks } from 'uplot';
import { TsTooltipOptions } from './ts-tooltip-options';
import { TSChartSeries } from './ts-chart-series';

export interface TSChartSettings {
  title: string;
  xValues: number[]; // in milliseconds
  cursor?: Cursor; // cursor related settings and events
  series: TSChartSeries[];
  autoResize?: boolean; // autoresize on window size change
  axes: Axis[];
  tooltipOptions: TsTooltipOptions;
  showLegend?: boolean; // default true
  hooks?: Hooks.Arrays; // if some hooks have to be override
  truncated?: boolean;
  showCursor?: boolean;
  showTimeAxes?: boolean;
  zoomEnabled?: boolean;
}
