import { FilterBarItem } from './performance-view/filter-bar/model/filter-bar-item';
import { TimeseriesColorsPool } from './util/timeseries-colors-pool';
import { TimeSeriesKeywordsContext } from './pages/execution-page/time-series-keywords.context';
import { TsFilteringSettings } from './model/ts-filtering-settings';
import { TimeRange } from '@exense/step-core';

export interface TimeSeriesContextParams {
  id: string;
  timeRange: TimeRange;
  grouping: string[];
  filters?: FilterBarItem[];
  colorsPool?: TimeseriesColorsPool;
  keywordsContext?: TimeSeriesKeywordsContext;
  filteringSettings?: TsFilteringSettings;
}
