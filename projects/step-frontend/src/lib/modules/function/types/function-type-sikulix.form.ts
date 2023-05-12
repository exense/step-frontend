import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionSikulix } from './function-sikulix.interface';

export type FunctionTypeSikulixForm = ReturnType<typeof functionTypeSikulixFormCreate>;

export const functionTypeSikulixFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    sikulixProjectJar: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeSikulixFormSetValueToForm = (form: FunctionTypeSikulixForm, model: FunctionSikulix): void => {
  const { sikulixProjectJar } = model;

  form.patchValue({
    sikulixProjectJar,
  });
};

export const functionTypeSikulixFormSetValueToModel = (form: FunctionTypeSikulixForm, model: FunctionSikulix): void => {
  const { sikulixProjectJar } = form.value;

  model.sikulixProjectJar = sikulixProjectJar!;
};
