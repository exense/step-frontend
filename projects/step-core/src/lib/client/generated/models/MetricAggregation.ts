/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MetricAggregation = {
  type: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';
  params?: Record<string, any>;
};
