import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  FunctionTypeFormComponent,
  FunctionTypeScriptOption,
  FUNCTION_TYPE_SCRIPT_OPTIONS,
  ScriptLanguage,
  ArrayItemLabelValueExtractor,
} from '@exense/step-core';
import { FunctionScript } from '../../types/function-script.interface';
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
  standalone: false,
})
export class FunctionTypeScriptComponent extends FunctionTypeFormComponent<FunctionTypeScriptForm> {
  private _formBuilder = inject(FormBuilder);

  protected readonly formGroup = functionTypeScriptFormCreate(this._formBuilder);
  protected readonly _functionTypeScriptOptions = inject(FUNCTION_TYPE_SCRIPT_OPTIONS);
  protected readonly ScriptLanguage = ScriptLanguage;

  protected readonly arrayItemExtractor: ArrayItemLabelValueExtractor<FunctionTypeScriptOption, ScriptLanguage> = {
    getValue: (item: FunctionTypeScriptOption) => item.scriptLanguage,
    getLabel: (item: FunctionTypeScriptOption) => item.label,
  };

  filterMultiControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: FunctionTypeScriptOption[] = [];

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
