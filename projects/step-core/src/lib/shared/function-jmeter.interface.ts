import { DynamicValueString, Function } from '../client/generated';

export interface FunctionJMeter extends Function {
  jmeterTestplan: DynamicValueString;
}
