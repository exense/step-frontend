import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface CheckArtefact extends AbstractArtefact {
  expression: DynamicValueString;
}
