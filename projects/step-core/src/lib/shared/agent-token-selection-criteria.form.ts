import { FormBuilder } from '@angular/forms';
import { KeyValuePair } from '../domain';

export type AgentTokenSelectionCriteriaForm = ReturnType<typeof agentTokenSelectionCriteriaFormCreate>;

export const agentTokenSelectionCriteriaFormCreate = (formBuilder: FormBuilder) => {
  const formGroup = formBuilder.nonNullable.group({
    key: formBuilder.nonNullable.control<string>('', []),
    value: formBuilder.nonNullable.control<string>('', []),
  });

  return formGroup;
};

export const agentTokenSelectionCriteriaFormSetValueToForm = (
  form: AgentTokenSelectionCriteriaForm,
  model: KeyValuePair<string, string>
): void => {
  const { key, value } = model;

  form.patchValue({
    key,
    value,
  });
};

export const agentTokenSelectionCriteriaFormSetValueToModel = (
  form: AgentTokenSelectionCriteriaForm,
  model: KeyValuePair<string, string>
): void => {
  const { key, value } = form.value;

  model.key = key!;
  model.value = value!;
};
