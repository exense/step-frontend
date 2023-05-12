import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionJMeter } from './function-jmeter.interface';

export type FunctionTypeJMeterForm = ReturnType<typeof functionTypeJMeterFormCreate>;

export const functionTypeJMeterFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    jmeterTestplan: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeJMeterFormSetValueToForm = (form: FunctionTypeJMeterForm, model: FunctionJMeter): void => {
  const { jmeterTestplan } = model;

  form.patchValue({
    jmeterTestplan,
  });
};

export const functionTypeJMeterFormSetValueToModel = (form: FunctionTypeJMeterForm, model: FunctionJMeter): void => {
  const { jmeterTestplan } = form.value;

  model.jmeterTestplan = jmeterTestplan!;
};
