import { WizardStep } from './wizard-step.interface';
import { EnvironmentInjector, Injector } from '@angular/core';

export interface WizardStepMeta {
  step: WizardStep;
  stepInjector: EnvironmentInjector;
}
