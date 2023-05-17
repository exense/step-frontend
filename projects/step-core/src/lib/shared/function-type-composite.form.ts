import { FormBuilder } from '@angular/forms';
import { FunctionComposite } from './function-composite.interface';

export type FunctionTypeCompositeForm = ReturnType<typeof functionTypeCompositeFormCreate>;

export const functionTypeCompositeFormCreate = (formBuilder: FormBuilder) => {
  const formGroup = formBuilder.nonNullable.group({});

  return formGroup;
};

export const functionTypeCompositeFormSetValueToForm = (
  form: FunctionTypeCompositeForm,
  model: FunctionComposite
): void => {};

export const functionTypeCompositeFormSetValueToModel = (
  form: FunctionTypeCompositeForm,
  model: FunctionComposite
): void => {};
