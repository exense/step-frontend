/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AxesSettings } from './AxesSettings';
import type { MetricAttribute } from './MetricAttribute';
import type { TimeSeriesFilterItem } from './TimeSeriesFilterItem';

export type ChartSettings = {
  metricKey: string;
  attributes: Array<MetricAttribute>;
  primaryAxes: AxesSettings;
  secondaryAxes?: AxesSettings;
  filters: Array<TimeSeriesFilterItem>;
  oql?: string;
  grouping: Array<string>;
  inheritGlobalFilters: boolean;
  inheritGlobalGrouping: boolean;
  readonlyGrouping: boolean;
  readonlyAggregate: boolean;
};
