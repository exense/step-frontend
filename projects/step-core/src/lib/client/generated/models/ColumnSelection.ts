/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricAggregation } from './MetricAggregation';

export type ColumnSelection = {
  column: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'PCL_1' | 'PCL_2' | 'PCL_3' | 'TPS' | 'TPH';
  aggregation: MetricAggregation;
  selected?: boolean;
};
