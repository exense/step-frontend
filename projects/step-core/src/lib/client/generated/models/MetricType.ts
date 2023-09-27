/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricTypeRenderSettings } from './MetricTypeRenderSettings';

export type MetricType = {
  customFields?: Record<string, any>;
  label?: string;
  oqlQuery?: string;
  renderSettings?: MetricTypeRenderSettings;
  id?: string;
};
