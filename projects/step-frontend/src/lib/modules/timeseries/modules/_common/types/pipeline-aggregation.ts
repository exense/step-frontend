import { TwoStageAggregation } from '@exense/step-core';

export type PipelineTimeAggregation = Exclude<TwoStageAggregation['timeAggregation'], 'MERGE'>;
export type PipelineGroupAggregation = Exclude<TwoStageAggregation['groupAggregation'], 'MERGE'>;

export interface PipelineAggregationOption<T> {
  value: T;
  label: string;
}

export const PIPELINE_GROUP_AGGREGATION_OPTIONS: PipelineAggregationOption<PipelineGroupAggregation>[] = [
  { value: 'AVG', label: 'Average' },
  { value: 'SUM', label: 'Sum' },
  { value: 'COUNT', label: 'Count' },
  { value: 'MIN', label: 'Min' },
  { value: 'MAX', label: 'Max' },
];

export const PIPELINE_TIME_AGGREGATION_OPTIONS: PipelineAggregationOption<PipelineTimeAggregation>[] = [
  ...PIPELINE_GROUP_AGGREGATION_OPTIONS,
  { value: 'SAMPLED_AVG', label: 'Sampled average' },
];
