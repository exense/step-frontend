import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface SwitchArtefact extends AbstractArtefact {
  expression: DynamicValueString;
}
