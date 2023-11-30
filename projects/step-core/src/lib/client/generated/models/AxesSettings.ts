/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricRenderingSettings } from './MetricRenderingSettings';

export type AxesSettings = {
  aggregation?: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';
  displayType?: 'LINE' | 'BAR_CHART';
  unit?: string;
  renderingSettings?: MetricRenderingSettings;
};
