/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricAggregation } from './MetricAggregation';
import type { MetricAttribute } from './MetricAttribute';
import type { MetricRenderingSettings } from './MetricRenderingSettings';

export type MetricType = {
  customFields?: Record<string, any>;
  name: string;
  displayName: string;
  description?: string;
  attributes: Array<MetricAttribute>;
  unit?: string;
  defaultAggregation: MetricAggregation;
  defaultGroupingAttributes: Array<string>;
  renderingSettings: MetricRenderingSettings;
  id?: string;
};
