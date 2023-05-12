import { FormBuilder } from '@angular/forms';
import { dynamicValueFactory, DynamicValueString } from '@exense/step-core';
import { FunctionQFTest } from './function-qftest.interface';

export type FunctionTypeQFTestForm = ReturnType<typeof functionTypeQFTestFormCreate>;

export const functionTypeQFTestFormCreate = (formBuilder: FormBuilder) => {
  const { createDynamicValueString } = dynamicValueFactory();
  const formGroup = formBuilder.nonNullable.group({
    suite: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
    transferSuiteToAgents: formBuilder.nonNullable.control<boolean>(false, []),
    procedure: formBuilder.nonNullable.control<DynamicValueString>(createDynamicValueString(), []),
  });

  return formGroup;
};

export const functionTypeQFTestFormSetValueToForm = (form: FunctionTypeQFTestForm, model: FunctionQFTest): void => {
  const { suite, transferSuiteToAgents, procedure } = model;

  form.patchValue({
    suite,
    transferSuiteToAgents,
    procedure,
  });
};

export const functionTypeQFTestFormSetValueToModel = (form: FunctionTypeQFTestForm, model: FunctionQFTest): void => {
  const { suite, transferSuiteToAgents, procedure } = form.value;

  model.suite = suite!;
  model.transferSuiteToAgents = transferSuiteToAgents!;
  model.procedure = procedure!;
};
