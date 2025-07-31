import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString, ScriptLanguage } from '@exense/step-core';
import { FunctionScript } from '../../types/function-script.interface';

export type FunctionTypeScriptForm = ReturnType<typeof functionTypeScriptFormCreate>;

export const functionTypeScriptFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    scriptLanguage: formBuilder.nonNullable.control<ScriptLanguage>(ScriptLanguage.JAVA, []),
    librariesFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    scriptFile: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeScriptFormSetValueToForm = (form: FunctionTypeScriptForm, model: FunctionScript): void => {
  const { scriptLanguage, librariesFile, scriptFile } = model;

  if (scriptLanguage) {
    form.patchValue({
      scriptLanguage: scriptLanguage.value,
    });
  }

  if (librariesFile) {
    form.patchValue({
      librariesFile,
    });
  }

  if (scriptFile) {
    form.patchValue({
      scriptFile,
    });
  }
};

export const functionTypeScriptFormSetValueToModel = (form: FunctionTypeScriptForm, model: FunctionScript): void => {
  const { scriptLanguage, librariesFile, scriptFile } = form.value;

  model.scriptLanguage = {
    value: scriptLanguage!,
  };
  model.librariesFile = librariesFile!;
  model.scriptFile = scriptFile!;
};
