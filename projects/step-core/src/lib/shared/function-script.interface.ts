import { DynamicValueString, Function, FunctionScriptLanguage } from '@exense/step-core';

export interface FunctionScript extends Function {
  scriptLanguage: FunctionScriptLanguage;
  librariesFile: DynamicValueString;
  scriptFile: DynamicValueString;
}
