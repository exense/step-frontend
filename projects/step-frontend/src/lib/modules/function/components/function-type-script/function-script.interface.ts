import { DynamicValueString, Function as Keyword, FunctionScriptLanguage } from '@exense/step-core';

export interface FunctionScript extends Keyword {
  scriptLanguage: FunctionScriptLanguage;
  librariesFile: DynamicValueString;
  scriptFile: DynamicValueString;
}
