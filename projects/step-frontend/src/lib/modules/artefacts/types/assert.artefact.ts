import { AbstractArtefact, DynamicValueBoolean, DynamicValueString } from '@exense/step-core';
import { OperatorType } from './operator-type.enum';

export interface AssertArtefact extends AbstractArtefact {
  actual: DynamicValueString;
  operator: OperatorType;
  expected: DynamicValueString;
  doNegate: DynamicValueBoolean;
  customErrorMessage: DynamicValueString;
}
