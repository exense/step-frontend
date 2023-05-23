import { DynamicValueString, Function as Keyword } from '../client/generated';
import { FunctionScriptLanguage } from './function-script-language.interface';

export interface FunctionScript extends Keyword {
  scriptLanguage: FunctionScriptLanguage;
  librariesFile: DynamicValueString;
  scriptFile: DynamicValueString;
}
