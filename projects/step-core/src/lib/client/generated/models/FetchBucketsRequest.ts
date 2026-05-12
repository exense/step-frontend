/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FetchBucketsRequest = {
  start?: number;
  end?: number;
  metricType?: string;
  oqlFilter?: string;
  params?: Record<string, any>;
  groupDimensions?: Array<string>;
  numberOfBuckets?: number;
  intervalSize?: number;
  percentiles?: Array<number>;
  collectAttributeKeys?: Array<string>;
  collectAttributesValuesLimit?: number;
  maxNumberOfSeries?: number;
  includeGlobalEntities?: boolean;
};
