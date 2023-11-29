/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AxesSettings = {
  metricKey?: string;
  aggregation?: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';
  displayType?: 'LINE' | 'BAR_CHART';
  unit?: string;
};
