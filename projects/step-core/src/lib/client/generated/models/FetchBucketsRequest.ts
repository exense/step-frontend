/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FetchBucketsRequest = {
  start?: number;
  end?: number;
  params?: Record<string, string>;
  threadGroupBuckets?: boolean;
  groupDimensions?: Array<string>;
  numberOfBuckets?: number;
  intervalSize?: number;
  percentiles?: Array<number>;
};
