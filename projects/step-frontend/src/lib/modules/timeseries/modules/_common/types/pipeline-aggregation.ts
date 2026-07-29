import { MetricAggregation } from '@exense/step-core';
import { TimeSeriesConfig } from './time-series/time-series.config';

/**
 * Scalar aggregations supported by the two-stage aggregation. They match the BE Aggregation enum, MERGE
 * excluded: the two stages strictly reduce their inputs to scalar values.
 */
export enum PipelineAggregation {
  AVG = 'AVG',
  SUM = 'SUM',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
}

export interface AggregationPipeline {
  timeAggregation: PipelineAggregation;
  groupAggregation: PipelineAggregation;
}

export interface PipelineAggregationOption {
  value: PipelineAggregation;
  label: string;
}

/** Options offered by the time and series aggregation pickers of the two-stage mode */
export const PIPELINE_AGGREGATION_OPTIONS: PipelineAggregationOption[] = [
  { value: PipelineAggregation.AVG, label: 'Average' },
  { value: PipelineAggregation.SUM, label: 'Sum' },
  { value: PipelineAggregation.COUNT, label: 'Count' },
  { value: PipelineAggregation.MIN, label: 'Min' },
  { value: PipelineAggregation.MAX, label: 'Max' },
];

export class PipelineAggregationUtils {
  /**
   * An axes uses a two-stage aggregation when both scalar aggregations are stored in the aggregation params.
   * Returns undefined for single-stage (merge based) aggregations.
   */
  static getTwoStagePipeline(aggregation?: MetricAggregation): AggregationPipeline | undefined {
    const timeAggregation = aggregation?.params?.[TimeSeriesConfig.TIME_AGGREGATION_PARAM];
    const groupAggregation = aggregation?.params?.[TimeSeriesConfig.GROUP_AGGREGATION_PARAM];
    if (!timeAggregation || !groupAggregation) {
      return undefined;
    }
    return { timeAggregation, groupAggregation };
  }

  static createTwoStageAggregation(pipeline: AggregationPipeline): MetricAggregation {
    // the type mirrors the final scalar operation so that consumers unaware of pipelines degrade gracefully
    return {
      type: pipeline.groupAggregation,
      params: {
        [TimeSeriesConfig.TIME_AGGREGATION_PARAM]: pipeline.timeAggregation,
        [TimeSeriesConfig.GROUP_AGGREGATION_PARAM]: pipeline.groupAggregation,
      },
    };
  }

  static createSingleStageAggregation(aggregation: MetricAggregation): MetricAggregation {
    const params = { ...aggregation.params };
    delete params[TimeSeriesConfig.TIME_AGGREGATION_PARAM];
    delete params[TimeSeriesConfig.GROUP_AGGREGATION_PARAM];
    return { type: aggregation.type, params };
  }

  static getPipelineLabel(pipeline: AggregationPipeline): string {
    return `${pipeline.timeAggregation} → ${pipeline.groupAggregation}`;
  }
}
