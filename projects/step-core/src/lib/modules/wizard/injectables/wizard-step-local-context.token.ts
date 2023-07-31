import { InjectionToken } from '@angular/core';
import { WizardStepLocalContext } from '../types/wizard-step-local-context.interface';

export const WIZARD_STEP_LOCAL_CONTEXT = new InjectionToken<WizardStepLocalContext>('Step local context');
