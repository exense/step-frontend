import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionDotnet } from './function-dotnet.interface';

export type FunctionTypeDotnetForm = ReturnType<typeof functionTypeDotnetFormCreate>;

export const functionTypeDotnetFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    librariesFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    dllFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeDotnetFormSetValueToForm = (form: FunctionTypeDotnetForm, model: FunctionDotnet): void => {
  const { librariesFile, dllFile } = model;

  form.patchValue({
    librariesFile,
    dllFile,
  });
};

export const functionTypeDotnetFormSetValueToModel = (form: FunctionTypeDotnetForm, model: FunctionDotnet): void => {
  const { librariesFile, dllFile } = form.value;

  model.librariesFile = librariesFile!;
  model.dllFile = dllFile!;
};
