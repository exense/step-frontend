import { TSTimeRange } from '../../chart/model/ts-time-range';

export interface PerformanceViewSettings {
  contextId: string; // this must be unique across the application
  contextualFilters: { [key: string]: string };
  timeRange: TSTimeRange;
  includeThreadGroupChart?: boolean;
}
