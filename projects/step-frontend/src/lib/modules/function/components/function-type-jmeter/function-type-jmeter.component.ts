import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  FunctionJMeter,
  FunctionTypeFormComponent,
  FunctionTypeJMeterForm,
  functionTypeJMeterFormCreate,
  functionTypeJMeterFormSetValueToForm,
  functionTypeJMeterFormSetValueToModel,
  higherOrderValidator,
} from '@exense/step-core';

@Component({
  selector: 'step-function-type-jmeter',
  templateUrl: './function-type-jmeter.component.html',
  styleUrls: ['./function-type-jmeter.component.scss'],
})
export class FunctionTypeJMeterComponent extends FunctionTypeFormComponent<FunctionTypeJMeterForm> {
  private _formBuilder = inject(FormBuilder);

  protected readonly formGroup = functionTypeJMeterFormCreate(this._formBuilder);
  protected readonly formGroupValidator = higherOrderValidator(this.formGroup);

  protected override setValueToForm(): void {
    functionTypeJMeterFormSetValueToForm(this.formGroup, this.context!.keyword as FunctionJMeter);
  }

  protected override setValueToModel(): void {
    functionTypeJMeterFormSetValueToModel(this.formGroup, this.context!.keyword as FunctionJMeter);
  }
}
