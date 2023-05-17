import { DynamicValueString, Function } from '@exense/step-core';

export interface FunctionJMeter extends Function {
  jmeterTestplan: DynamicValueString;
}
