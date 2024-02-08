import { BucketResponse } from '@exense/step-core';

export interface ResponseTimeMetric {
  label: string;
  mapFunction: (b: BucketResponse) => number | undefined;
}
