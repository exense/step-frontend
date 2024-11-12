import { AbstractArtefact, DynamicValueInteger, DynamicValueString } from '@exense/step-core';

export interface WhileArtefact extends AbstractArtefact {
  condition: DynamicValueString;
  postCondition: DynamicValueString;
  pacing: DynamicValueInteger;
  timeout: DynamicValueInteger;
  maxIterations: DynamicValueInteger;
}
