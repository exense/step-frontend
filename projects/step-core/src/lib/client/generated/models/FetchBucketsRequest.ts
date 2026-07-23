/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FetchBucketsRequest = {
  start?: number;
  end?: number;
  oqlFilter?: string;
  params?: Record<string, any>;
  groupDimensions?: Array<string>;
  timeAggregation?: 'MERGE' | 'AVG' | 'SUM' | 'COUNT' | 'MIN' | 'MAX';
  groupAggregation?: 'MERGE' | 'AVG' | 'SUM' | 'COUNT' | 'MIN' | 'MAX';
  numberOfBuckets?: number;
  intervalSize?: number;
  percentiles?: Array<number>;
  collectAttributeKeys?: Array<string>;
  collectAttributesValuesLimit?: number;
  maxNumberOfSeries?: number;
  includeGlobalEntities?: boolean;
  metricType?: string;
};
