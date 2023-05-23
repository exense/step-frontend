import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  FunctionNodeJS,
  FunctionTypeFormComponent,
  FunctionTypeNodeJSForm,
  functionTypeNodeJSFormCreate,
  functionTypeNodeJSFormSetValueToForm,
  functionTypeNodeJSFormSetValueToModel,
  higherOrderValidator,
} from '@exense/step-core';

@Component({
  selector: 'step-function-type-node-js',
  templateUrl: './function-type-node-js.component.html',
  styleUrls: ['./function-type-node-js.component.scss'],
})
export class FunctionTypeNodeJSComponent extends FunctionTypeFormComponent<FunctionTypeNodeJSForm> {
  private _formBuilder = inject(FormBuilder);

  protected readonly formGroup = functionTypeNodeJSFormCreate(this._formBuilder);
  protected readonly formGroupValidator = higherOrderValidator(this.formGroup);

  protected override setValueToForm(): void {
    functionTypeNodeJSFormSetValueToForm(this.formGroup, this.context!.keyword as FunctionNodeJS);
  }

  protected override setValueToModel(): void {
    functionTypeNodeJSFormSetValueToModel(this.formGroup, this.context!.keyword as FunctionNodeJS);
  }
}
