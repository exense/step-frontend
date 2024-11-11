import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface CallPlanArtefact extends AbstractArtefact {
  planId?: string;
  input: DynamicValueString;
}
