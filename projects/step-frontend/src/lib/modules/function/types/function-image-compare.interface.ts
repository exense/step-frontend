import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionImageCompare extends Omit<Function, 'type'> {
  type: FunctionType.IMAGE_COMPARE;
  scenarioFile: DynamicValueString;
}
