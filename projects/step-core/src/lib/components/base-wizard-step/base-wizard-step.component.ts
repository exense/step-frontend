import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { Component } from '@angular/core';

@Component({
  template: '',
})
export abstract class BaseWizardStepComponent implements CustomComponent {
  context?: any;
}
