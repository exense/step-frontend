import { FormGroup } from '@angular/forms';

export interface WizardStepFormConfig<T = any, F extends FormGroup = FormGroup> {
  createStepForm(): F;
  setModelToForm(model: T, form: F): void;
  setFormToModel(model: T, form: F): void;
  setupFormBehavior?(form: F): void;
}
