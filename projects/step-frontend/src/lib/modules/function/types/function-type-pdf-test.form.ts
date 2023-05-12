import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionPDFTest } from './function-pdf-test.interface';

export type FunctionTypePDFTestForm = ReturnType<typeof functionTypePDFTestFormCreate>;

export const functionTypePDFTestFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    scenarioFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypePDFTestFormSetValueToForm = (form: FunctionTypePDFTestForm, model: FunctionPDFTest): void => {
  const { scenarioFile } = model;

  form.patchValue({
    scenarioFile,
  });
};

export const functionTypePDFTestFormSetValueToModel = (form: FunctionTypePDFTestForm, model: FunctionPDFTest): void => {
  const { scenarioFile } = form.value;

  model.scenarioFile = scenarioFile!;
};
