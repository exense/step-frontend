import { FormBuilder } from '@angular/forms';
import { DynamicValueString } from '../client/generated';
import { dynamicValueValidatorsFactory } from './dynamic-value-validators-factory';
import { FunctionJMeter } from './function-jmeter.interface';
import { dynamicValueFactory } from './utils';

export type FunctionTypeJMeterForm = ReturnType<typeof functionTypeJMeterFormCreate>;

export const functionTypeJMeterFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const { dynamicValueStringValidators } = dynamicValueValidatorsFactory();
  const formGroup = formBuilder.nonNullable.group({
    jmeterTestplan: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), [
      dynamicValueStringValidators.required,
    ]),
  });

  return formGroup;
};

export const functionTypeJMeterFormSetValueToForm = (form: FunctionTypeJMeterForm, model: FunctionJMeter): void => {
  const { jmeterTestplan } = model;

  if (jmeterTestplan) {
    form.patchValue({
      jmeterTestplan,
    });
  }
};

export const functionTypeJMeterFormSetValueToModel = (form: FunctionTypeJMeterForm, model: FunctionJMeter): void => {
  const { jmeterTestplan } = form.value;

  model.jmeterTestplan = jmeterTestplan!;
};
