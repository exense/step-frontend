import { AbstractArtefact, DynamicValueBoolean, DynamicValueString } from '@exense/step-core';

export interface KeywordArtefact extends AbstractArtefact {
  description: string;
  argument: DynamicValueString;
  resultMap: DynamicValueString;
  remote: DynamicValueBoolean;
  token: DynamicValueString;
}
