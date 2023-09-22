import { InjectionToken } from '@angular/core';
import { WizardStepFormConfig } from '../types/wizard-step-form-config.interface';

export const WIZARD_STEP_FORM_CONFIG = new InjectionToken<WizardStepFormConfig>('Wizard step form config');
