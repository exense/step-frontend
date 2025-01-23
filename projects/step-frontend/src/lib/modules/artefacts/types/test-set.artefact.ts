import { AbstractArtefact, DynamicValueInteger } from '@exense/step-core';

export interface TestSetArtefact extends AbstractArtefact {
  threads: DynamicValueInteger;
}
