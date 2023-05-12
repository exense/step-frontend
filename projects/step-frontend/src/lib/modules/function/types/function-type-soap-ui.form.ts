import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionSoapUI } from './function-soap-ui.interface';

export type FunctionTypeSoapUIForm = ReturnType<typeof functionTypeSoapUIFormCreate>;

export const functionTypeSoapUIFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    projectFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    testSuite: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    testCase: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeSoapUIFormSetValueToForm = (form: FunctionTypeSoapUIForm, model: FunctionSoapUI): void => {
  const { projectFile, testSuite, testCase } = model;

  form.patchValue({
    projectFile,
    testSuite,
    testCase,
  });
};

export const functionTypeSoapUIFormSetValueToModel = (form: FunctionTypeSoapUIForm, model: FunctionSoapUI): void => {
  const { projectFile, testSuite, testCase } = form.value;

  model.projectFile = projectFile!;
  model.testSuite = testSuite!;
  model.testCase = testCase!;
};
