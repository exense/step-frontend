import { FormGroup } from '@angular/forms';

export abstract class WizardStepFormService<T = any, F extends FormGroup = FormGroup> {
  abstract createStepForm(): F;
  abstract setModelToForm(model: T, form: F): void;
  abstract setFormToModel(model: T, form: F): void;
  abstract setupFormBehavior?(form: F): void;
}
