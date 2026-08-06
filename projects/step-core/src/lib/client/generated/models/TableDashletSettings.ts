/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ColumnSelection } from './ColumnSelection';
import type { MetricAggregation } from './MetricAggregation';

export type TableDashletSettings = {
  columns: Array<ColumnSelection>;
  aggregation?: MetricAggregation;
};
