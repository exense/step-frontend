import { DashboardItem, MetricAttribute, MetricType, TimeRange } from '@exense/step-core';
import { TimeseriesColorsPool } from './timeseries-colors-pool';
import { TsFilteringSettings } from '../filter/ts-filtering-settings';
import { TimeSeriesSyncGroup } from './time-series-sync-group';

export interface TimeSeriesContextParams {
  id: string;
  dashlets: DashboardItem[];
  timeRange: TimeRange;
  defaultFullTimeRange?: Partial<TimeRange>; // used as a reset range, mostly in execution view where it is known
  selectedTimeRange?: TimeRange; // ranger selection
  metrics?: MetricType[];
  attributes?: MetricAttribute[];
  grouping: string[];
  colorsPool?: TimeseriesColorsPool;
  syncGroups?: TimeSeriesSyncGroup[];
  filteringSettings: TsFilteringSettings;
  editMode?: boolean;
  resolution?: number;
  refreshInterval?: number;
}
