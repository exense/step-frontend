import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface ReturnArtefact extends AbstractArtefact {
  output: DynamicValueString;
}
