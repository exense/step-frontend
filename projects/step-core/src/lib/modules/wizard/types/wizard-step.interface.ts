import { Type } from '@angular/core';
import { CustomRegistryItem } from '../../custom-registeries/custom-registries.module';
import { WizardStepFormService } from '../injectables/wizard-step-form.service';
import { WizardStepBehaviorService } from '../injectables/wizard-step-behavior.service';

export interface WizardStep extends CustomRegistryItem {
  formConfig?: Type<WizardStepFormService>;
  behaviorConfig?: Type<WizardStepBehaviorService>;
}
