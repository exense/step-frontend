import { DynamicValueString, Function } from '../client/generated';
import { FunctionScriptLanguage } from './function-script-language.interface';

export interface FunctionScript extends Function {
  scriptLanguage: FunctionScriptLanguage;
  librariesFile: DynamicValueString;
  scriptFile: DynamicValueString;
}
