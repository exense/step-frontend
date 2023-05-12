import { Component, inject } from '@angular/core';
import { CustomComponent, ScriptLanguage } from '@exense/step-core';
import {
  FunctionTypeScriptOption,
  FUNCTION_TYPE_SCRIPT_OPTIONS,
} from '../../services/function-type-script-options.token';
import { FunctionTypeScriptForm } from '../../types/function-type-script.form';

@Component({
  selector: 'step-function-type-script',
  templateUrl: './function-type-script.component.html',
  styleUrls: ['./function-type-script.component.scss'],
})
export class FunctionTypeScriptComponent implements CustomComponent {
  protected readonly functionTypeScriptOptions = inject<FunctionTypeScriptOption[]>(FUNCTION_TYPE_SCRIPT_OPTIONS);
  protected readonly ScriptLanguage = ScriptLanguage;

  context?: FunctionTypeScriptForm;

  protected get scriptLanguage(): ScriptLanguage | undefined {
    return this.context?.controls.scriptLanguage.value.value;
  }
}
