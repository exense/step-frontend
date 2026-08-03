import { Injectable } from '@angular/core';
import { FetchBucketsRequest, MetricAggregation, TwoStageAggregation } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class PipelineAggregationService {
  getTwoStageAggregation(aggregation?: MetricAggregation): TwoStageAggregation | undefined {
    return aggregation?.type === 'TWO_STAGE' ? aggregation.twoStageAggregation : undefined;
  }

  createTwoStageAggregation(twoStageAggregation: TwoStageAggregation): MetricAggregation {
    return { type: 'TWO_STAGE', twoStageAggregation };
  }

  getDisplayAggregation(aggregation: MetricAggregation): MetricAggregation {
    const twoStageAggregation = this.getTwoStageAggregation(aggregation);
    return twoStageAggregation ? (this.toDisplayAggregation(twoStageAggregation) ?? aggregation) : aggregation;
  }

  getFetchBucketsAggregationOptions(
    aggregation?: MetricAggregation,
  ): Pick<FetchBucketsRequest, 'timeAggregation' | 'groupAggregation'> {
    const twoStageAggregation = this.getTwoStageAggregation(aggregation);
    return twoStageAggregation
      ? {
          timeAggregation: twoStageAggregation.timeAggregation,
          groupAggregation: twoStageAggregation.groupAggregation,
        }
      : {};
  }

  getPipelineLabel(twoStageAggregation: TwoStageAggregation): string {
    return `${twoStageAggregation.timeAggregation} → ${twoStageAggregation.groupAggregation}`;
  }

  private toDisplayAggregation(twoStageAggregation: TwoStageAggregation): MetricAggregation | undefined {
    if (twoStageAggregation.groupAggregation === 'MERGE') {
      return undefined;
    }
    return { type: twoStageAggregation.groupAggregation };
  }
}
