import { FormBuilder } from '@angular/forms';
import { KeyValuePair } from '@exense/step-core';

export type AgentTokenSelectionCriterionForm = ReturnType<typeof agentTokenSelectionCriterionFormCreate>;

export const agentTokenSelectionCriterionFormCreate = (formBuilder: FormBuilder) => {
  const formGroup = formBuilder.nonNullable.group({
    key: formBuilder.nonNullable.control<string>('', []),
    value: formBuilder.nonNullable.control<string>('', []),
  });

  return formGroup;
};

export const agentTokenSelectionCriterionFormSetValueToForm = (
  form: AgentTokenSelectionCriterionForm,
  model: KeyValuePair<string, string>
): void => {
  const { key, value } = model;

  form.patchValue({
    key,
    value,
  });
};

export const agentTokenSelectionCriterionFormSetValueToModel = (
  form: AgentTokenSelectionCriterionForm,
  model: KeyValuePair<string, string>
): void => {
  const { key, value } = form.value;

  model.key = key!;
  model.value = value!;
};
