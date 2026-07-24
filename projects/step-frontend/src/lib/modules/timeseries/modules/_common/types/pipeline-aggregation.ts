import { MetricAggregation } from '@exense/step-core';
import { TimeSeriesConfig } from './time-series/time-series.config';

/**
 * Scalar aggregations supported by the custom aggregation pipeline. They match the BE Aggregation enum, MERGE
 * excluded: custom pipelines strictly reduce their inputs to scalar values.
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

export class PipelineAggregationUtils {
  /**
   * An axes uses a custom aggregation pipeline when both scalar aggregations are stored in the aggregation params.
   * Returns undefined for standard (merge based) aggregations.
   */
  static getCustomPipeline(aggregation?: MetricAggregation): AggregationPipeline | undefined {
    const timeAggregation = aggregation?.params?.[TimeSeriesConfig.TIME_AGGREGATION_PARAM];
    const groupAggregation = aggregation?.params?.[TimeSeriesConfig.GROUP_AGGREGATION_PARAM];
    if (!timeAggregation || !groupAggregation) {
      return undefined;
    }
    return { timeAggregation, groupAggregation };
  }

  static createCustomPipelineAggregation(pipeline: AggregationPipeline): MetricAggregation {
    // the type mirrors the final scalar operation so that consumers unaware of pipelines degrade gracefully
    return {
      type: pipeline.groupAggregation,
      params: {
        [TimeSeriesConfig.TIME_AGGREGATION_PARAM]: pipeline.timeAggregation,
        [TimeSeriesConfig.GROUP_AGGREGATION_PARAM]: pipeline.groupAggregation,
      },
    };
  }

  static createStandardAggregation(aggregation: MetricAggregation): MetricAggregation {
    const params = { ...aggregation.params };
    delete params[TimeSeriesConfig.TIME_AGGREGATION_PARAM];
    delete params[TimeSeriesConfig.GROUP_AGGREGATION_PARAM];
    return { type: aggregation.type, params };
  }

  static getPipelineLabel(pipeline: AggregationPipeline): string {
    return `${pipeline.timeAggregation} → ${pipeline.groupAggregation}`;
  }
}
