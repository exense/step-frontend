/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChartFilterItem } from './ChartFilterItem';
import type { DashboardItem } from './DashboardItem';
import type { TimeRangeSelection } from './TimeRangeSelection';

export type DashboardView = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  name: string;
  description?: string;
  resolution?: number;
  timeRange: TimeRangeSelection;
  grouping: Array<string>;
  filters: Array<ChartFilterItem>;
  dashlets: Array<DashboardItem>;
  metadata?: Record<string, any>;
  id?: string;
};
