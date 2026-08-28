/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TwoStageAggregation = {
  timeAggregation: 'MERGE' | 'AVG' | 'SAMPLED_AVG' | 'SUM' | 'COUNT' | 'MIN' | 'MAX';
  groupAggregation: 'MERGE' | 'AVG' | 'SUM' | 'COUNT' | 'MIN' | 'MAX';
};
