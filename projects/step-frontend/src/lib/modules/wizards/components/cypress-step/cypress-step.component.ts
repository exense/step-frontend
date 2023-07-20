import { Component } from '@angular/core';
import { BaseWizardStepComponent } from '@exense/step-core';
import { CypressStepForm } from './cypress-step.form';

@Component({
  selector: 'step-cypress-step',
  templateUrl: './cypress-step.component.html',
  styleUrls: ['./cypress-step.component.scss'],
})
export class CypressStepComponent extends BaseWizardStepComponent<CypressStepForm> {
  override context?: CypressStepForm;
}
