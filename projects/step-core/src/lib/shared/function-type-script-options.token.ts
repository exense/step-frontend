import { InjectionToken } from '@angular/core';
import { ScriptLanguage } from './script-language.enum';

export interface FunctionTypeScriptOption {
  label: string;
  scriptLanguage: ScriptLanguage;
}

export const FUNCTION_TYPE_SCRIPT_OPTIONS = new InjectionToken<FunctionTypeScriptOption[]>(
  'Function type script options',
  {
    providedIn: 'root',
    factory: () => {
      return [
        {
          label: 'java',
          scriptLanguage: ScriptLanguage.JAVA,
        },
        {
          label: 'javascript',
          scriptLanguage: ScriptLanguage.JAVASCRIPT,
        },
        {
          label: 'groovy',
          scriptLanguage: ScriptLanguage.GROOVY,
        },
      ];
    },
  }
);
