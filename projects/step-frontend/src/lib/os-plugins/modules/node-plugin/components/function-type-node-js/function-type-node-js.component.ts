import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FunctionTypeFormComponent } from '@exense/step-core';
import { FunctionNodeJS } from './function-node-js.interface';
import {
  FunctionTypeNodeJSForm,
  functionTypeNodeJSFormCreate,
  functionTypeNodeJSFormSetValueToForm,
  functionTypeNodeJSFormSetValueToModel,
} from './function-type-node-js.form';

@Component({
  selector: 'step-function-type-node-js',
  templateUrl: './function-type-node-js.component.html',
  styleUrls: ['./function-type-node-js.component.scss'],
  standalone: false,
})
export class FunctionTypeNodeJSComponent extends FunctionTypeFormComponent<FunctionTypeNodeJSForm> {
  private _formBuilder = inject(FormBuilder);

  protected readonly formGroup = functionTypeNodeJSFormCreate(this._formBuilder);

  override setValueToForm(): void {
    functionTypeNodeJSFormSetValueToForm(this.formGroup, this._parent.keyword as FunctionNodeJS);
  }

  override setValueToModel(): void {
    functionTypeNodeJSFormSetValueToModel(this.formGroup, this._parent.keyword as FunctionNodeJS);
  }
}
