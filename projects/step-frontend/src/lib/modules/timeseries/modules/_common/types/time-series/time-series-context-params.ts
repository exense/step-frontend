import { MetricAttribute, TimeRange } from '@exense/step-core';
import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { FilterBarItem } from '../filter/filter-bar-item';
import { TimeseriesColorsPool } from './timeseries-colors-pool';
import { TsFilteringSettings } from '../filter/ts-filtering-settings';
import { TimeSeriesSyncGroup } from './time-series-sync-group';

export interface TimeSeriesContextParams {
  id: string;
  timeRange: TimeRange;
  attributes?: MetricAttribute[];
  grouping: string[];
  filters?: FilterBarItem[];
  colorsPool?: TimeseriesColorsPool;
  /**
   * @Deprecated
   */
  keywordsContext?: TimeSeriesKeywordsContext;
  syncGroups?: TimeSeriesSyncGroup[];
  filteringSettings?: TsFilteringSettings;
  editMode?: boolean;
  resolution?: number;
}
