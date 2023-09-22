import { inject, Injectable } from '@angular/core';
import { WizardRegistryService } from '../../custom-registeries/custom-registries.module';
import { WizardStep } from '../types/wizard-step.interface';

@Injectable({
  providedIn: 'root',
})
export class WizardStepRegistryService {
  private _wizardRegistry = inject(WizardRegistryService);

  registerStep(step: WizardStep): void {
    this._wizardRegistry.registerWizardStep(step);
  }

  getStep(type: string): WizardStep {
    return this._wizardRegistry.getWizardStep(type);
  }
}
