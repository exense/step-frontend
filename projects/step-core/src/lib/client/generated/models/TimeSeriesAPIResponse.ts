/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BucketAttributes } from './BucketAttributes';
import type { BucketResponse } from './BucketResponse';

export type TimeSeriesAPIResponse = {
  start: number;
  interval: number;
  end: number;
  matrix: Array<Array<BucketResponse>>;
  matrixKeys: Array<BucketAttributes>;
  truncated: boolean;
  collectionResolution: number;
  collectionIgnoredAttributes: string[];
  higherResolutionUsed: boolean;
  ttlCovered: boolean;
};
