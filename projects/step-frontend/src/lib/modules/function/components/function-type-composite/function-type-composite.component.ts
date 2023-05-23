import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  FunctionComposite,
  FunctionTypeCompositeForm,
  functionTypeCompositeFormCreate,
  functionTypeCompositeFormSetValueToForm,
  functionTypeCompositeFormSetValueToModel,
  FunctionTypeFormComponent,
  higherOrderValidator,
} from '@exense/step-core';

@Component({
  selector: 'step-function-type-composite',
  templateUrl: './function-type-composite.component.html',
  styleUrls: ['./function-type-composite.component.scss'],
})
export class FunctionTypeCompositeComponent extends FunctionTypeFormComponent<FunctionTypeCompositeForm> {
  private _formBuilder = inject(FormBuilder);

  protected readonly formGroup = functionTypeCompositeFormCreate(this._formBuilder);
  protected readonly formGroupValidator = higherOrderValidator(this.formGroup);

  protected override setValueToForm(): void {
    functionTypeCompositeFormSetValueToForm(this.formGroup, this.context!.keyword as FunctionComposite);
  }

  protected override setValueToModel(): void {
    functionTypeCompositeFormSetValueToModel(this.formGroup, this.context!.keyword as FunctionComposite);
  }
}
