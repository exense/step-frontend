/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChartSettings } from './ChartSettings';
import type { TableSettings } from './TableSettings';
import type { TimeSeriesFilterItem } from './TimeSeriesFilterItem';

export type DashboardItem = {
  id: string;
  name: string;
  type: 'CHART' | 'TABLE' | 'PIE_CHART';
  metricKey: string;
  filters: Array<TimeSeriesFilterItem>;
  oql?: string;
  grouping: Array<string>;
  inheritGlobalFilters: true;
  inheritGlobalGrouping: true;
  chartSettings?: ChartSettings;
  tableSettings?: TableSettings;
  size: number;
  masterChartId?: string;
};
