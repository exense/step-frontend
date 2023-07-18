import { TSTimeRange } from './chart/model/ts-time-range';
import { TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';
import { TimeseriesColorsPool } from './util/timeseries-colors-pool';

export interface TimeSeriesContextParams {
  id: string;
  timeRange: TSTimeRange;
  grouping: string[];
  filters?: TsFilterItem[];
  colorsPool?: TimeseriesColorsPool;
}
