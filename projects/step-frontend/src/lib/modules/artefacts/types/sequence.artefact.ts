import { AbstractArtefact, DynamicValueBoolean, DynamicValueInteger } from '@exense/step-core';

export interface SequenceArtefact extends AbstractArtefact {
  continueOnError: DynamicValueBoolean;
  pacing: DynamicValueInteger;
}
