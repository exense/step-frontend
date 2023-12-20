/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AxesSettings } from './AxesSettings';
import type { ChartFilterItem } from './ChartFilterItem';
import type { MetricAttribute } from './MetricAttribute';

export type ChartSettings = {
  metricKey: string;
  attributes: Array<MetricAttribute>;
  primaryAxes: AxesSettings;
  filters: Array<ChartFilterItem>;
  grouping: Array<string>;
  inheritGlobalFilters: boolean;
  inheritGlobalGrouping: boolean;
  readonlyGrouping: boolean;
  readonlyAggregate: boolean;
};
