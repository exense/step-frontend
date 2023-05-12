import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionScriptLanguage } from './function-script-language.interface';
import { FunctionType } from './function-type.enum';

export interface FunctionScript extends Omit<Function, 'type'> {
  type: FunctionType.SCRIPT;
  scriptLanguage: FunctionScriptLanguage;
  librariesFile: DynamicValueString;
  scriptFile: DynamicValueString;
}
