import { InjectionToken } from '@angular/core';
import { ScriptLanguage } from '@exense/step-core';
import { FunctionScriptLanguage } from '../types/function-script-language.interface';

export interface FunctionTypeScriptOption {
  label: string;
  scriptLanguage: FunctionScriptLanguage;
}

export const FUNCTION_TYPE_SCRIPT_OPTIONS = new InjectionToken<FunctionTypeScriptOption[]>(
  'Function type script options',
  {
    providedIn: 'root',
    factory: () => {
      return [
        {
          label: 'java',
          scriptLanguage: {
            value: ScriptLanguage.java,
          },
        },
        {
          label: 'javascript',
          scriptLanguage: {
            value: ScriptLanguage.javascript,
          },
        },
        {
          label: 'groovy',
          scriptLanguage: {
            value: ScriptLanguage.groovy,
          },
        },
      ];
    },
  }
);
