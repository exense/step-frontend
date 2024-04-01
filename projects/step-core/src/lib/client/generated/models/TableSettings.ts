/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ColumnSelection } from './ColumnSelection';
import type { MetricAttribute } from './MetricAttribute';
import type { TimeSeriesFilterItem } from './TimeSeriesFilterItem';

export type TableSettings = {
  metricKey: string;
  attributes: Array<MetricAttribute>;
  filters: Array<TimeSeriesFilterItem>;
  oql?: string;
  columns: Array<ColumnSelection>;
};
