import { ThroughputMetricType } from '../../model/throughput-metric-type';
import { BucketResponse } from '@exense/step-core';

export interface ThroughputMetric {
  label: ThroughputMetricType;
  mapFunction: (b: BucketResponse) => number;
  labelFunction: (value: number) => string;
  tooltipZAxisLabel: string;
}
