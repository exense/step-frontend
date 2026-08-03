import { PipelineAggregationService } from './pipeline-aggregation.service';

describe('PipelineAggregationService', () => {
  const service = new PipelineAggregationService();

  it('creates and reads a two-stage aggregation', () => {
    const twoStageAggregation = { timeAggregation: 'AVG' as const, groupAggregation: 'SUM' as const };
    const aggregation = service.createTwoStageAggregation(twoStageAggregation);

    expect(service.getTwoStageAggregation(aggregation)).toEqual(twoStageAggregation);
  });

  it('returns the group stage as the display aggregation', () => {
    const aggregation = service.createTwoStageAggregation({ timeAggregation: 'AVG', groupAggregation: 'COUNT' });

    expect(service.getDisplayAggregation(aggregation)).toEqual({ type: 'COUNT' });
  });

  it('preserves a two-stage aggregation with a MERGE group stage', () => {
    const aggregation = service.createTwoStageAggregation({ timeAggregation: 'AVG', groupAggregation: 'MERGE' });

    expect(service.getDisplayAggregation(aggregation)).toBe(aggregation);
  });
});
