import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionSikulix extends Omit<Function, 'type'> {
  type: FunctionType.SIKULIX;
  sikulixProjectJar: DynamicValueString;
}
