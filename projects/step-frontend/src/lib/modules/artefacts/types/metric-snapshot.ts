export type MetricSnapshotType = 'COUNTER' | 'GAUGE' | 'HISTOGRAM';

export interface MetricSnapshot {
  name?: string;
  labels?: Record<string, string>;
  type?: MetricSnapshotType;
  snapshotTimestamp?: number;
}

export interface CounterSnapshot extends MetricSnapshot {
  type: 'COUNTER';
  accumulatedDiff?: number;
  longRunningTotal?: number;
}

export interface SampledSnapshot extends MetricSnapshot {
  type: 'GAUGE' | 'HISTOGRAM';
  count?: number;
  sum?: number;
  min?: number;
  max?: number;
  last?: number;
  distribution?: Record<string, number>;
}
