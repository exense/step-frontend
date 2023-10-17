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
  renderingSettings?: MetricRenderingSettings;
  id?: string;
};
