import { FormBuilder } from '@angular/forms';
import { FunctionComposite } from './function-composite.interface';

export type FunctionTypeCompositeForm = ReturnType<typeof functionTypeCompositeFormCreate>;

export const functionTypeCompositeFormCreate = (formBuilder: FormBuilder) => {
  const formGroup = formBuilder.nonNullable.group({
    planId: formBuilder.nonNullable.control<string>('', []),
  });

  return formGroup;
};

export const functionTypeCompositeFormSetValueToForm = (
  form: FunctionTypeCompositeForm,
  model: FunctionComposite
): void => {
  const { planId } = model;

  form.patchValue({
    planId,
  });
};

export const functionTypeCompositeFormSetValueToModel = (
  form: FunctionTypeCompositeForm,
  model: FunctionComposite
): void => {
  const { planId } = form.value;

  model.planId = planId!;
};
