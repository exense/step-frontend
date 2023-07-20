import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { FormGroup } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  template: '',
})
export abstract class BaseWizardStepComponent<T extends FormGroup> implements CustomComponent {
  context?: T;
}
