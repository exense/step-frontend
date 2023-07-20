import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { CypressKeywordWizardStep } from '../../shared/cypress-keyword-wizard-step.interface';

export type CypressStepForm = ReturnType<typeof cypressStepFormCreate>;

export const cypressStepFormCreate = (formBuilder: NonNullableFormBuilder) =>
  formBuilder.group({
    project: formBuilder.control('', Validators.required),
    spec: formBuilder.control('', Validators.required),
  });

export const cypressStepSetModelToForm = (model: CypressKeywordWizardStep, form: CypressStepForm) => {
  form.setValue({
    project: model.project,
    spec: model.spec,
  });
};

export const cypressStepSetFormToModel = (model: CypressKeywordWizardStep, form: CypressStepForm) => {
  model.project = form.value.project ?? '';
  model.spec = form.value.spec ?? '';
};
