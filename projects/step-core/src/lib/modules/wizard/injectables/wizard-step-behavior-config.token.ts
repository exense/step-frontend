import { InjectionToken } from '@angular/core';
import { WizardStepBehaviorConfig } from '../types/wizard-step-behavior-config.interface';

export const WIZARD_STEP_BEHAVIOR_CONFIG = new InjectionToken<WizardStepBehaviorConfig>('Wizard step behavior token');
