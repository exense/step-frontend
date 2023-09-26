import { TSTimeRange } from './chart/model/ts-time-range';
import { TsFilterItem } from './performance-view/filter-bar/model/ts-filter-item';
import { TimeseriesColorsPool } from './util/timeseries-colors-pool';
import { TimeSeriesKeywordsContext } from './pages/execution-page/time-series-keywords.context';
import { TsFilteringSettings } from './model/ts-filtering-settings';

export interface TimeSeriesContextParams {
  id: string;
  timeRange: TSTimeRange;
  grouping: string[];
  filters?: TsFilterItem[];
  colorsPool?: TimeseriesColorsPool;
  keywordsContext?: TimeSeriesKeywordsContext;
  filteringSettings?: TsFilteringSettings;
}
