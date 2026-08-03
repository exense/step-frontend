import { TwoStageAggregation } from '@exense/step-core';

export type PipelineAggregation = Exclude<TwoStageAggregation['timeAggregation'], 'MERGE'>;

export interface PipelineAggregationOption {
  value: PipelineAggregation;
  label: string;
}

export const PIPELINE_AGGREGATION_OPTIONS: PipelineAggregationOption[] = [
  { value: 'AVG', label: 'Average' },
  { value: 'SUM', label: 'Sum' },
  { value: 'COUNT', label: 'Count' },
  { value: 'MIN', label: 'Min' },
  { value: 'MAX', label: 'Max' },
];
