import { Injectable } from '@angular/core';
import { BaseRegistryService } from './base-registry.service';
import { CustomRegistryService } from './custom-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { CustomRegistryItem } from '../shared/custom-registry-item';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';

export interface WizardStep {
  type: string;
}

export interface WizardStepMeta<T extends WizardStep> extends CustomRegistryItem {
  createStepForm(formBuilder: NonNullableFormBuilder): FormGroup;
  setModelToForm(model: T, form: FormGroup): void;
  setFormToModel(model: T, form: FormGroup): void;
}

@Injectable({
  providedIn: 'root',
})
export class WizardStepRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.wizardStep;

  constructor(customRegistry: CustomRegistryService) {
    super(customRegistry);
  }

  registerStep<T extends WizardStep>(type: string, wizardStepMeta: Omit<WizardStepMeta<T>, 'type'>) {
    this._customRegistry.register(this.registryType, type, {
      type,
      ...wizardStepMeta,
    });
  }

  getStep<T extends WizardStep>(type: string): WizardStepMeta<T> | undefined {
    return this._customRegistry.getRegisteredItem(this.registryType, type) as WizardStepMeta<T> | undefined;
  }
}
