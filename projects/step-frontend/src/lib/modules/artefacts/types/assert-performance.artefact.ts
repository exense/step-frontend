import {
  AbstractArtefact,
  AggregatorType,
  AssertOperatorType,
  DynamicValueInteger,
  DynamicValueString,
} from '@exense/step-core';

export interface AssertPerformanceArtefact extends AbstractArtefact {
  aggregator: AggregatorType;
  comparator: AssertOperatorType;
  expectedValue: DynamicValueInteger;
  filters?: {
    field: DynamicValueString;
    filter: DynamicValueString;
    filterType: AssertOperatorType;
  }[];
}
