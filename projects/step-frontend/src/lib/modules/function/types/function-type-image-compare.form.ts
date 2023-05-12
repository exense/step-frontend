import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionImageCompare } from './function-image-compare.interface';

export type FunctionTypeImageCompareForm = ReturnType<typeof functionTypeImageCompareFormCreate>;

export const functionTypeImageCompareFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    scenarioFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeImageCompareFormSetValueToForm = (
  form: FunctionTypeImageCompareForm,
  model: FunctionImageCompare
): void => {
  const { scenarioFile } = model;

  form.patchValue({
    scenarioFile,
  });
};

export const functionTypeImageCompareFormSetValueToModel = (
  form: FunctionTypeImageCompareForm,
  model: FunctionImageCompare
): void => {
  const { scenarioFile } = form.value;

  model.scenarioFile = scenarioFile!;
};
