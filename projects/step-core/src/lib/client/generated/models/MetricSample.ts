/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MetricSample = {
  sampleTime?: number;
  name?: string;
  labels?: Record<string, string>;
  type?: 'COUNTER' | 'GAUGE' | 'HISTOGRAM';
  count?: number;
  sum?: number;
  min?: number;
  max?: number;
  last?: number;
  distribution?: Record<string, number>;
};
