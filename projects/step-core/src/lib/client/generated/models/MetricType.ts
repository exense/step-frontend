/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetricAttribute } from './MetricAttribute';

export type MetricType = {
  customFields?: Record<string, any>;
  name?: string;
  label?: string;
  unit?: string;
  attributes?: Array<MetricAttribute>;
  groupingAttribute?: string;
  seriesColors?: Record<string, string>;
  id?: string;
};
