import { InjectionToken } from '@angular/core';
import { ScriptLanguage } from '@exense/step-core';

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
          scriptLanguage: ScriptLanguage.java,
        },
        {
          label: 'javascript',
          scriptLanguage: ScriptLanguage.javascript,
        },
        {
          label: 'groovy',
          scriptLanguage: ScriptLanguage.groovy,
        },
      ];
    },
  }
);
