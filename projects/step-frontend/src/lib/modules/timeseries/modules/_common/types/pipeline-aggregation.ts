import { MetricAggregation, TwoStageAggregation } from '@exense/step-core';

/**
 * Scalar aggregations offered for each stage of a two-stage aggregation. Derived from the backend enum so that both
 * cannot drift apart, MERGE excluded: the two stages strictly reduce their inputs to scalar values.
 */
export type PipelineAggregation = Exclude<TwoStageAggregation['timeAggregation'], 'MERGE'>;

export interface PipelineAggregationOption {
  value: PipelineAggregation;
  label: string;
}

/** Options offered by the time and series aggregation pickers of the two-stage mode */
export const PIPELINE_AGGREGATION_OPTIONS: PipelineAggregationOption[] = [
  { value: 'AVG', label: 'Average' },
  { value: 'SUM', label: 'Sum' },
  { value: 'COUNT', label: 'Count' },
  { value: 'MIN', label: 'Min' },
  { value: 'MAX', label: 'Max' },
];

export class PipelineAggregationUtils {
  /**
   * An aggregation of type TWO_STAGE carries its two stages in its twoStageAggregation. Returns undefined for the
   * single-stage aggregations, which extract their value out of the merged bucket instead.
   */
  static getTwoStageAggregation(aggregation?: MetricAggregation): TwoStageAggregation | undefined {
    return aggregation?.type === 'TWO_STAGE' ? aggregation.twoStageAggregation : undefined;
  }

  static createTwoStageAggregation(twoStageAggregation: TwoStageAggregation): MetricAggregation {
    return { type: 'TWO_STAGE', twoStageAggregation };
  }

  /**
   * The value displayed by a two-stage aggregation is the scalar produced by its group stage. This mirrors that stage
   * into a single-stage aggregation, so that the formatting and labelling helpers keep working on one common shape.
   * Returns undefined when the group stage merges, which the pickers never produce.
   */
  static toDisplayAggregation(twoStageAggregation: TwoStageAggregation): MetricAggregation | undefined {
    if (twoStageAggregation.groupAggregation === 'MERGE') {
      return undefined;
    }
    return { type: twoStageAggregation.groupAggregation };
  }

  static getPipelineLabel(twoStageAggregation: TwoStageAggregation): string {
    return `${twoStageAggregation.timeAggregation} → ${twoStageAggregation.groupAggregation}`;
  }
}
