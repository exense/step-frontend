import { WizardStep } from './wizard-step.interface';
import { EnvironmentInjector } from '@angular/core';

export interface WizardStepMeta {
  step: WizardStep;
  stepInjector: EnvironmentInjector;
}
