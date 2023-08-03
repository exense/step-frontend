import { Type } from '@angular/core';
import { CustomRegistryItem } from '../../custom-registeries/custom-registries.module';
import { WizardStepFormConfig } from './wizard-step-form-config.interface';
import { WizardStepBehaviorConfig } from './wizard-step-behavior-config.interface';

export interface WizardStep extends CustomRegistryItem {
  formConfig?: Type<WizardStepFormConfig>;
  behaviorConfig?: Type<WizardStepBehaviorConfig>;
}
