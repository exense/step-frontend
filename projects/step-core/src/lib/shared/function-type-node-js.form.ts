import { FormBuilder } from '@angular/forms';
import { DynamicValueString } from '../client/generated';
import { FunctionNodeJS } from './function-node-js.interface';
import { dynamicValueFactory } from './utils';

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

  if (jsFile) {
    form.patchValue({
      jsFile,
    });
  }
};

export const functionTypeNodeJSFormSetValueToModel = (form: FunctionTypeNodeJSForm, model: FunctionNodeJS): void => {
  const { jsFile } = form.value;

  model.jsFile = jsFile!;
};
