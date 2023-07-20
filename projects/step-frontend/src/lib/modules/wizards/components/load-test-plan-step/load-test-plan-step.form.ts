import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { LoadTestPlanWizardStep } from '../../shared/load-test-plan-wizard-step.interface';

export type LoadTestPlanStepForm = ReturnType<typeof loadTestPlanStepFormCreate>;

export const loadTestPlanStepFormCreate = (formBuilder: NonNullableFormBuilder) =>
  formBuilder.group({
    threads: formBuilder.control(0, [Validators.required, Validators.min(1)]),
    pacing: formBuilder.control(0, [Validators.required, Validators.min(1)]),
    iterations: formBuilder.control(0, [Validators.required, Validators.min(1)]),
    maxDuration: formBuilder.control(0, [Validators.required, Validators.min(1)]),
  });

export const loadTestPlanSetModelToForm = (model: LoadTestPlanWizardStep, form: LoadTestPlanStepForm) => {
  form.setValue({
    threads: model.threads,
    pacing: model.pacing,
    iterations: model.iterations,
    maxDuration: model.maxDuration,
  });
};

export const loadTestPlanSetFormToModel = (model: LoadTestPlanWizardStep, form: LoadTestPlanStepForm) => {
  model.threads = form.value.threads ?? 0;
  model.pacing = form.value.pacing ?? 0;
  model.iterations = form.value.iterations ?? 0;
  model.maxDuration = form.value.maxDuration ?? 0;
};
