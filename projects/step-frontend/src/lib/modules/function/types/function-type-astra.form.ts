import { FormBuilder } from '@angular/forms';
import { FunctionAstra } from './function-astra.interface';

export type FunctionTypeAstraForm = ReturnType<typeof functionTypeAstraFormCreate>;

export const functionTypeAstraFormCreate = (formBuilder: FormBuilder) => {
  const formGroup = formBuilder.nonNullable.group({});

  return formGroup;
};

export const functionTypeAstraFormSetValueToForm = (form: FunctionTypeAstraForm, model: FunctionAstra): void => {};

export const functionTypeAstraFormSetValueToModel = (form: FunctionTypeAstraForm, model: FunctionAstra): void => {};
