import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface SetArtefact extends AbstractArtefact {
  key: DynamicValueString;
  value: DynamicValueString;
}
