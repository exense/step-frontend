import { Axis, Band, Cursor, Hooks, Scale, Scales } from 'uplot';
import { TsTooltipOptions } from './ts-tooltip-options';
import { TSChartSeries } from './ts-chart-series';
import uPlot from '../../_common/types/uPlot';

export interface TSChartSettings {
  title: string;
  xAxesSettings: XAxesSettings;
  showDefaultLegend?: boolean;
  cursor?: Cursor; // cursor related settings and events
  series: TSChartSeries[];
  scales?: Scales;
  autoResize?: boolean; // autoresize on window size change
  axes: Axis[];
  bands?: Band[];
  tooltipOptions: TsTooltipOptions;
  showLegend?: boolean; // default true
  hooks?: Hooks.Arrays; // if some hooks have to be override
  truncated?: boolean;
  showCursor?: boolean;
  zoomEnabled?: boolean;
}

export interface XAxesSettings {
  values: number[];
  show?: boolean; // default true
  time?: boolean; // default true
  label?: string;
  incrs?: number[]; // specify multipliers of how the grid add more values when zooming.
  valueFormatFn?: (self: any, rawValue: number, seriesIdx: number, idx: number) => string | number;
}
