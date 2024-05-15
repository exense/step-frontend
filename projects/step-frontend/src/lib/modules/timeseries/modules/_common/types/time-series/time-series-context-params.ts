import { DashboardItem, MetricAttribute, TimeRange } from '@exense/step-core';
import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { FilterBarItem } from '../filter/filter-bar-item';
import { TimeseriesColorsPool } from './timeseries-colors-pool';
import { TsFilteringSettings } from '../filter/ts-filtering-settings';
import { TimeSeriesSyncGroup } from './time-series-sync-group';

export interface TimeSeriesContextParams {
  id: string;
  dashlets: DashboardItem[];
  timeRange: TimeRange;
  defaultFullTimeRange?: Partial<TimeRange>; // used as a reset range, mostly in execution view where it is known
  attributes?: MetricAttribute[];
  grouping: string[];
  colorsPool?: TimeseriesColorsPool;
  /**
   * @Deprecated
   */
  keywordsContext?: TimeSeriesKeywordsContext;
  syncGroups?: TimeSeriesSyncGroup[];
  filteringSettings: TsFilteringSettings;
  editMode?: boolean;
  resolution?: number;
}
