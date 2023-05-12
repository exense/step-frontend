import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionNodeJS } from './function-node-js.interface';

export type FunctionTypeNodeJSForm = ReturnType<typeof functionTypeNodeJSFormCreate>;

export const functionTypeNodeJSFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    jsFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeNodeJSFormSetValueToForm = (form: FunctionTypeNodeJSForm, model: FunctionNodeJS): void => {
  const { jsFile } = model;

  form.patchValue({
    jsFile,
  });
};

export const functionTypeNodeJSFormSetValueToModel = (form: FunctionTypeNodeJSForm, model: FunctionNodeJS): void => {
  const { jsFile } = form.value;

  model.jsFile = jsFile!;
};
