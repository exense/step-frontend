import { MetricAttribute, TimeRange } from '@exense/step-core';
import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { FilterBarItem } from '../filter/filter-bar-item';
import { TimeseriesColorsPool } from './timeseries-colors-pool';
import { TsFilteringSettings } from '../filter/ts-filtering-settings';

export interface TimeSeriesContextParams {
  id: string;
  timeRange: TimeRange;
  attributes?: Record<string, MetricAttribute>; // attributes of all dashlets by their ids
  grouping: string[];
  filters?: FilterBarItem[];
  colorsPool?: TimeseriesColorsPool;
  keywordsContext?: TimeSeriesKeywordsContext;
  filteringSettings?: TsFilteringSettings;
}
