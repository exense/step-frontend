/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DashboardItem } from './DashboardItem';
import type { TimeRangeSelection } from './TimeRangeSelection';
import type { TimeSeriesFilterItem } from './TimeSeriesFilterItem';

export type DashboardView = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  name: string;
  description?: string;
  resolution?: number;
  refreshInterval?: number;
  timeRange: TimeRangeSelection;
  grouping: Array<string>;
  filters: Array<TimeSeriesFilterItem>;
  dashlets: Array<DashboardItem>;
  metadata?: Record<string, any>;
  id?: string;
};
