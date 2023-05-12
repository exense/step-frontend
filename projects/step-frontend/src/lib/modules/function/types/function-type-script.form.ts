import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString, ScriptLanguage } from '@exense/step-core';
import { FunctionScriptLanguage } from './function-script-language.interface';
import { FunctionScript } from './function-script.interface';

export type FunctionTypeScriptForm = ReturnType<typeof functionTypeScriptFormCreate>;

export const functionTypeScriptFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    scriptLanguage: formBuilder.nonNullable.control<FunctionScriptLanguage>({ value: ScriptLanguage.java }, []),
    librariesFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    scriptFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeScriptFormSetValueToForm = (form: FunctionTypeScriptForm, model: FunctionScript): void => {
  const { scriptLanguage, librariesFile, scriptFile } = model;

  form.patchValue({
    scriptLanguage,
    librariesFile,
    scriptFile,
  });
};

export const functionTypeScriptFormSetValueToModel = (form: FunctionTypeScriptForm, model: FunctionScript): void => {
  const { scriptLanguage, librariesFile, scriptFile } = form.value;

  model.scriptLanguage = scriptLanguage!;
  model.librariesFile = librariesFile!;
  model.scriptFile = scriptFile!;
};
