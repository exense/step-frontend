import { DynamicValueString, Function } from '@exense/step-core';

export interface FunctionNodeJS extends Function {
  jsFile: DynamicValueString;
}
