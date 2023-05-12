import { Component, inject } from '@angular/core';
import { CustomComponent, ScriptLanguage } from '@exense/step-core';
import {
  FunctionTypeScriptOption,
  FUNCTION_TYPE_SCRIPT_OPTIONS,
} from '../../services/function-type-script-options.token';
import { FunctionTypeOryonForm } from '../../types/function-type-oryon.form';

@Component({
  selector: 'step-function-type-oryon',
  templateUrl: './function-type-oryon.component.html',
  styleUrls: ['./function-type-oryon.component.scss'],
})
export class FunctionTypeOryonComponent implements CustomComponent {
  protected readonly functionTypeScriptOptions = inject<FunctionTypeScriptOption[]>(FUNCTION_TYPE_SCRIPT_OPTIONS);
  protected readonly ScriptLanguage = ScriptLanguage;

  context?: FunctionTypeOryonForm;

  protected get scriptLanguage(): ScriptLanguage | undefined {
    return this.context?.controls.scriptLanguage.value.value;
  }
}
