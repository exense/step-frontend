import { TSTimeRange } from '../../chart/model/ts-time-range';

export interface TimeSeriesDashboardSettings {
  contextId: string; // this must be unique across the application
  contextualFilters: { [key: string]: string };
  includeThreadGroupChart?: boolean;
  timeRange: TSTimeRange;
}
