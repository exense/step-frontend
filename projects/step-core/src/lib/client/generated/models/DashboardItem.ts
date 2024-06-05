/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChartSettings } from './ChartSettings';
import type { MetricAttribute } from './MetricAttribute';
import type { TableDashletSettings } from './TableDashletSettings';
import type { TimeSeriesFilterItem } from './TimeSeriesFilterItem';

export type DashboardItem = {
  id: string;
  name: string;
  type: 'CHART' | 'TABLE' | 'PIE_CHART';
  masterChartId?: string;
  metricKey: string;
  attributes: Array<MetricAttribute>;
  filters: Array<TimeSeriesFilterItem>;
  inheritSpecificFiltersOnly: boolean;
  specificFiltersToInherit: string[];
  oql?: string;
  grouping: Array<string>;
  inheritGlobalFilters: boolean;
  inheritGlobalGrouping: boolean;
  readonlyGrouping: boolean;
  readonlyAggregate: boolean;
  chartSettings?: ChartSettings;
  tableSettings?: TableDashletSettings;
  size: number;
};
