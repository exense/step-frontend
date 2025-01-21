import { AbstractArtefact, DynamicValueString } from '@exense/step-core';

export interface ExportArtefact extends AbstractArtefact {
  value: DynamicValueString;
  file: DynamicValueString;
  prefix: DynamicValueString;
  filter: DynamicValueString;
}
