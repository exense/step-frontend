/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type BucketResponse = {
  begin: number;
  attributes: Record<string, any>;
  count: number;
  sum: number;
  min: number;
  max: number;
  pclValues?: Record<string, number>;
  throughputPerHour: number;
};
