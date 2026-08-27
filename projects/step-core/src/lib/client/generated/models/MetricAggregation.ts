/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TwoStageAggregation } from './TwoStageAggregation';

export type MetricAggregation = {
  type: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE' | 'TWO_STAGE';
  twoStageAggregation?: TwoStageAggregation;
  params?: Record<string, any>;
};
