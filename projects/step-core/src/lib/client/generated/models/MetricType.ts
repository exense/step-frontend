/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricAttribute } from './MetricAttribute';
import type { MetricRenderingSettings } from './MetricRenderingSettings';

export type MetricType = {
  customFields?: Record<string, any>;
  key?: string;
  name?: string;
  description?: string;
  attributes?: Array<MetricAttribute>;
  unit?: 'MS' | 'PERCENTAGE' | 'EMPTY';
  defaultAggregation?: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';
  defaultGroupingAttributes?: Array<string>;
  renderingSettings?: MetricRenderingSettings;
  id?: string;
};
