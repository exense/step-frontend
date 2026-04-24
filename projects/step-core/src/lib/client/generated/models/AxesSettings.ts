/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricAggregation } from './MetricAggregation';
import type { MetricRenderingSettings } from './MetricRenderingSettings';

export type AxesSettings = {
  aggregation: MetricAggregation;
  displayType: 'LINE' | 'BAR_CHART' | 'STEPPED' | 'STACKED_BAR';
  unit: string;
  renderingSettings?: MetricRenderingSettings;
  colorizationType: 'STROKE' | 'FILL';
};
