import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface CaseArtefact extends AbstractArtefact {
  value: DynamicValueString;
}
