import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface SessionArtefact extends AbstractArtefact {
  token: DynamicValueString;
}
