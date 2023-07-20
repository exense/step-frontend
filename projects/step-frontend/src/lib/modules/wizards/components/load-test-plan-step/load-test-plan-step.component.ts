import { Component } from '@angular/core';
import { BaseWizardStepComponent } from '@exense/step-core';
import { LoadTestPlanStepForm } from './load-test-plan-step.form';

@Component({
  selector: 'step-load-test-plan-step',
  templateUrl: './load-test-plan-step.component.html',
  styleUrls: ['./load-test-plan-step.component.scss'],
})
export class LoadTestPlanStepComponent extends BaseWizardStepComponent<LoadTestPlanStepForm> {
  override context?: LoadTestPlanStepForm;
}
