/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricTypeRenderSettings } from './MetricTypeRenderSettings';

export type MetricType = {
  customFields?: Record<string, any>;
  label?: string;
  attributeValue?: string;
  renderSettings?: MetricTypeRenderSettings;
  id?: string;
};
