import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, WizardStep } from '@exense/step-core';
import { CypressKeywordWizardStep } from '../../shared/cypress-keyword-wizard-step.interface';
import { LoadTestPlanWizardStep } from '../../shared/load-test-plan-wizard-step.interface';

@Component({
  selector: 'step-wizard-dashboard',
  templateUrl: './wizard-dashboard.component.html',
  styleUrls: ['./wizard-dashboard.component.scss'],
})
export class WizardDashboardComponent {
  isWizardVisible = false;

  readonly wizardExample = [
    {
      type: 'cypress-keyword',
      project: '',
      spec: '',
    } as CypressKeywordWizardStep,
    {
      type: 'load-test-plan',
      threads: 0,
      pacing: 0,
      iterations: 0,
      maxDuration: 0,
    } as LoadTestPlanWizardStep,
  ];

  resultSteps?: WizardStep[];

  startWizard(): void {
    this.resultSteps = undefined;
    this.isWizardVisible = true;
  }

  finishWizard(steps: WizardStep[]): void {
    this.resultSteps = steps;
    this.isWizardVisible = false;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepWizardDashboard', downgradeComponent({ component: WizardDashboardComponent }));
