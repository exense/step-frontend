import { DynamicValueString, Keyword, FunctionScriptLanguage } from '@exense/step-core';

export interface FunctionScript extends Keyword {
  scriptLanguage: FunctionScriptLanguage;
  librariesFile: DynamicValueString;
  scriptFile: DynamicValueString;
}
