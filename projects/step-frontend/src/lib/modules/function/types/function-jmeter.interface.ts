import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionJMeter extends Omit<Function, 'type'> {
  type: FunctionType.JMETER;
  jmeterTestplan: DynamicValueString;
}
