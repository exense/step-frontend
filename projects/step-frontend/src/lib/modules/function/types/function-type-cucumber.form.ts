import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionCucumber } from './function-cucumber.interface';

export type FunctionTypeCucumberForm = ReturnType<typeof functionTypeCucumberFormCreate>;

export const functionTypeCucumberFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    classpathDirectory: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    featureDirectory: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    cucumberOptions: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeCucumberFormSetValueToForm = (
  form: FunctionTypeCucumberForm,
  model: FunctionCucumber
): void => {
  const { classpathDirectory, featureDirectory, cucumberOptions } = model;

  form.patchValue({
    classpathDirectory,
    featureDirectory,
    cucumberOptions,
  });
};

export const functionTypeCucumberFormSetValueToModel = (
  form: FunctionTypeCucumberForm,
  model: FunctionCucumber
): void => {
  const { classpathDirectory, featureDirectory, cucumberOptions } = form.value;

  model.classpathDirectory = classpathDirectory!;
  model.featureDirectory = featureDirectory!;
  model.cucumberOptions = cucumberOptions!;
};
