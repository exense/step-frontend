import { AfterContentInit, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import {
  FunctionTypeFormComponent,
  FunctionTypeScriptOption,
  FUNCTION_TYPE_SCRIPT_OPTIONS,
  ScriptLanguage,
  ItemInfo,
} from '@exense/step-core';
import { FunctionScript } from './function-script.interface';
import {
  FunctionTypeScriptForm,
  functionTypeScriptFormCreate,
  functionTypeScriptFormSetValueToForm,
  functionTypeScriptFormSetValueToModel,
} from './function-type-script.form';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-function-type-script',
  templateUrl: './function-type-script.component.html',
  styleUrls: ['./function-type-script.component.scss'],
})
export class FunctionTypeScriptComponent
  extends FunctionTypeFormComponent<FunctionTypeScriptForm>
  implements AfterContentInit
{
  private _formBuilder = inject(FormBuilder);
  private _destroyRef = inject(DestroyRef);

  protected readonly formGroup = functionTypeScriptFormCreate(this._formBuilder);
  protected readonly functionTypeScriptOptions = inject<FunctionTypeScriptOption[]>(FUNCTION_TYPE_SCRIPT_OPTIONS);
  protected readonly ScriptLanguage = ScriptLanguage;

  filterMultiControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: FunctionTypeScriptOption[] = [];

  protected get scriptLanguage(): ScriptLanguage | undefined {
    return this.formGroup.controls.scriptLanguage.value;
  }

  ngAfterContentInit(): void {
    this.dropdownItemsFiltered = [...this.functionTypeScriptOptions];
    this.filterMultiControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      if (value) {
        this.dropdownItemsFiltered = this.functionTypeScriptOptions.filter((item) =>
          item.label.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        this.dropdownItemsFiltered = [...this.functionTypeScriptOptions];
      }
    });
  }

  override setValueToForm(): void {
    functionTypeScriptFormSetValueToForm(this.formGroup, this._parent.keyword as FunctionScript);
  }

  override setValueToModel(): void {
    functionTypeScriptFormSetValueToModel(this.formGroup, this._parent.keyword as FunctionScript);
  }
}
