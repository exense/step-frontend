import { Injectable } from '@angular/core';
import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryService } from './custom-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { CustomRegistryItem } from '../shared/custom-registry-item';

@Injectable({
  providedIn: 'root',
})
export class WizardRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.wizardStep;

  constructor(customRegistry: CustomRegistryService) {
    super(customRegistry);
  }

  registerWizardStep<T extends CustomRegistryItem>(wizardStep: T): void {
    this._customRegistry.register(this.registryType, wizardStep.type, wizardStep);
  }

  getWizardStep<T extends CustomRegistryItem>(type: string): T {
    return this._customRegistry.getRegisteredItem(this.registryType, type) as T;
  }
}
