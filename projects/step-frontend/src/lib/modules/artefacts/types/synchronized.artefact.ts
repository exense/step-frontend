import { AbstractArtefact, DynamicValueBoolean, DynamicValueString } from '@exense/step-core';

export interface Synchronized extends AbstractArtefact {
  lockName: DynamicValueString;
  globalLock: DynamicValueBoolean;
}
