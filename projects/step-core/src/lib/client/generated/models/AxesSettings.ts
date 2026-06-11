/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricAggregation } from './MetricAggregation';
import type { MetricRenderingSettings } from './MetricRenderingSettings';

export type AxesSettings = {
  aggregation: MetricAggregation;
  displayType: 'LINE' | 'BAR_CHART' | 'STACKED_BAR' | 'STEPPED';
  unit: string;
  renderingSettings?: MetricRenderingSettings;
  colorizationType: 'STROKE' | 'FILL';
};
