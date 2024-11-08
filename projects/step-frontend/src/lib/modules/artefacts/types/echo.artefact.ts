import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface EchoArtefact extends AbstractArtefact {
  text: DynamicValueString;
}
