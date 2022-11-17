import { ThroughputMetricType } from '../../model/throughput-metric-type';
import { Bucket } from '../../bucket';

export interface ThroughputMetric {
  label: ThroughputMetricType;
  mapFunction: (b: Bucket) => number;
  labelFunction: (value: number) => string;
  tooltipZAxisLabel: string;
}
