import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString, ScriptLanguage } from '@exense/step-core';
import { FunctionOryon } from './function-oryon.interface';
import { FunctionScriptLanguage } from './function-script-language.interface';

export type FunctionTypeOryonForm = ReturnType<typeof functionTypeOryonFormCreate>;

export const functionTypeOryonFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    scriptLanguage: formBuilder.nonNullable.control<FunctionScriptLanguage>({ value: ScriptLanguage.groovy }, []),
    scriptFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeOryonFormSetValueToForm = (form: FunctionTypeOryonForm, model: FunctionOryon): void => {
  const { scriptLanguage, scriptFile } = model;

  form.patchValue({
    scriptLanguage,
    scriptFile,
  });
};

export const functionTypeOryonFormSetValueToModel = (form: FunctionTypeOryonForm, model: FunctionOryon): void => {
  const { scriptLanguage, scriptFile } = form.value;

  model.scriptLanguage = scriptLanguage!;
  model.scriptFile = scriptFile!;
};
