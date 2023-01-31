import { TSTimeRange } from './chart/model/ts-time-range';
import { TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';

export interface TimeSeriesContextParams {
  id: string;
  timeRange: TSTimeRange;
  grouping: string[];
  baseFilters: any;
  dynamicFilters?: TsFilterItem[];
}
