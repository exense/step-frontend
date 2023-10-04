/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MetricRenderingSettings = {
  unit?: 'MS' | 'PERCENTAGE' | 'EMPTY';
  defaultAggregation?: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';
  seriesColors?: Record<string, string>;
  defaultGroupingAttributes?: Array<string>;
};
