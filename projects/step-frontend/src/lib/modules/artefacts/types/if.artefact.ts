import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface IfArtefact extends AbstractArtefact {
  condition: DynamicValueString;
}
