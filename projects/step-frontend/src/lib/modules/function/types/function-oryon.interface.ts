import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionScriptLanguage } from './function-script-language.interface';
import { FunctionType } from './function-type.enum';

export interface FunctionOryon extends Omit<Function, 'type'> {
  type: FunctionType.ORYON;
  scriptLanguage: FunctionScriptLanguage;
  scriptFile: DynamicValueString;
}
