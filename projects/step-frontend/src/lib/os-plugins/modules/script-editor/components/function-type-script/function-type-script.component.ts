import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  FunctionTypeFormComponent,
  FunctionTypeScriptOption,
  FUNCTION_TYPE_SCRIPT_OPTIONS,
  ScriptLanguage,
} from '@exense/step-core';
import { FunctionScript } from './function-script.interface';
import {
  FunctionTypeScriptForm,
  functionTypeScriptFormCreate,
  functionTypeScriptFormSetValueToForm,
  functionTypeScriptFormSetValueToModel,
} from './function-type-script.form';

@Component({
  selector: 'step-function-type-script',
  templateUrl: './function-type-script.component.html',
  styleUrls: ['./function-type-script.component.scss'],
})
export class FunctionTypeScriptComponent extends FunctionTypeFormComponent<FunctionTypeScriptForm> {
  private _formBuilder = inject(FormBuilder);

  protected readonly formGroup = functionTypeScriptFormCreate(this._formBuilder);
  protected readonly functionTypeScriptOptions = inject<FunctionTypeScriptOption[]>(FUNCTION_TYPE_SCRIPT_OPTIONS);
  protected readonly ScriptLanguage = ScriptLanguage;

  protected get scriptLanguage(): ScriptLanguage | undefined {
    return this.formGroup.controls.scriptLanguage.value;
  }

  override setValueToForm(): void {
    functionTypeScriptFormSetValueToForm(this.formGroup, this._parent.keyword as FunctionScript);
  }

  override setValueToModel(): void {
    functionTypeScriptFormSetValueToModel(this.formGroup, this._parent.keyword as FunctionScript);
  }
}
