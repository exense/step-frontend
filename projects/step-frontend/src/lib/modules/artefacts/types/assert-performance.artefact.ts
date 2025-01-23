import { AbstractArtefact, AggregatorType, AssertOperatorType, DynamicValueString } from '@exense/step-core';

export interface AssertPerformanceArtefact extends AbstractArtefact {
  aggregator: AggregatorType;
  comparator: AssertOperatorType;
  expectedValue: DynamicValueString;
  filters?: {
    field: DynamicValueString;
    filter: DynamicValueString;
    filterType: AssertOperatorType;
  }[];
}
