/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FetchBucketsRequest = {
  start?: number;
  end?: number;
  oqlFilter?: string;
  params?: Record<string, any>;
  groupDimensions?: Array<string>;
  numberOfBuckets?: number;
  intervalSize?: number;
  percentiles?: Array<number>;
};
