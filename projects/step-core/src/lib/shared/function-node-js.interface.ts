import { DynamicValueString, Function } from '../client/generated';

export interface FunctionNodeJS extends Function {
  jsFile: DynamicValueString;
}
