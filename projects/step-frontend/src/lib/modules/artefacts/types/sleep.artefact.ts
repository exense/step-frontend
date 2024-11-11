import { DynamicValueInteger, DynamicValueString, WaitingArtefactsAdvancedArtefact } from '@exense/step-core';

export interface SleepArtefact extends WaitingArtefactsAdvancedArtefact {
  duration: DynamicValueInteger;
  unit: DynamicValueString;
}
