import { FormGroup } from '@angular/forms';

export interface WizardGlobalContext<T = any, F extends FormGroup = FormGroup> {
  wizardForm?: F;
  model?: T;
  updateModel(): void;
}
