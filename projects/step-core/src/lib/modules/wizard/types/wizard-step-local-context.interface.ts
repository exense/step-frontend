import { FormGroup } from '@angular/forms';
import { WizardStepFormService } from '../injectables/wizard-step-form.service';
import { WizardStepBehaviorService } from '../injectables/wizard-step-behavior.service';

export interface WizardStepLocalContext<
  Form extends FormGroup = FormGroup,
  StepFormService extends WizardStepFormService = WizardStepFormService,
  StepBehaviorService extends WizardStepBehaviorService = WizardStepBehaviorService
> {
  readonly stepForm?: Form;
  readonly stepFormService?: StepFormService;
  readonly stepBehaviorService?: StepBehaviorService;
}
