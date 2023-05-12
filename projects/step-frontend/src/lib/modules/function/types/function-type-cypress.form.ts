import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionCypress } from './function-cypress.interface';

export type FunctionTypeCypressForm = ReturnType<typeof functionTypeCypressFormCreate>;

export const functionTypeCypressFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    command: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    cypressProject: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    baseUrl: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeCypressFormSetValueToForm = (form: FunctionTypeCypressForm, model: FunctionCypress): void => {
  const { command, cypressProject, baseUrl } = model;

  form.patchValue({
    command,
    cypressProject,
    baseUrl,
  });
};

export const functionTypeCypressFormSetValueToModel = (form: FunctionTypeCypressForm, model: FunctionCypress): void => {
  const { command, cypressProject, baseUrl } = form.value;

  model.command = command!;
  model.cypressProject = cypressProject!;
  model.baseUrl = baseUrl!;
};
