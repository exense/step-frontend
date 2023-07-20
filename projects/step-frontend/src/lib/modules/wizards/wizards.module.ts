import { NgModule } from '@angular/core';
import { ViewRegistryService, WizardStepRegistryService } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { WizardDashboardComponent } from './components/wizard-dashboard/wizard-dashboard.component';
import { CypressStepComponent } from './components/cypress-step/cypress-step.component';
import {
  cypressStepFormCreate,
  cypressStepSetFormToModel,
  cypressStepSetModelToForm,
} from './components/cypress-step/cypress-step.form';
import { LoadTestPlanStepComponent } from './components/load-test-plan-step/load-test-plan-step.component';
import {
  loadTestPlanSetFormToModel,
  loadTestPlanSetModelToForm,
  loadTestPlanStepFormCreate,
} from './components/load-test-plan-step/load-test-plan-step.form';
import { WizardStepsComponent } from './components/wizard-steps/wizard-steps.component';

@NgModule({
  declarations: [WizardDashboardComponent, CypressStepComponent, LoadTestPlanStepComponent, WizardStepsComponent],
  imports: [StepCommonModule],
  exports: [WizardDashboardComponent, CypressStepComponent, WizardStepsComponent],
})
export class WizardsModule {
  constructor(private _stepWizards: WizardStepRegistryService, private _viewRegistry: ViewRegistryService) {
    this.registerStepWizards();
    this.registerViews();
    this.registerMenuItems();
  }

  private registerStepWizards(): void {
    this._stepWizards.registerStep('cypress-keyword', {
      label: 'Cypress Keyword',
      component: CypressStepComponent,
      createStepForm: cypressStepFormCreate,
      setFormToModel: cypressStepSetFormToModel,
      setModelToForm: cypressStepSetModelToForm,
    });
    this._stepWizards.registerStep('load-test-plan', {
      label: 'Load Test Plan',
      component: LoadTestPlanStepComponent,
      createStepForm: loadTestPlanStepFormCreate,
      setFormToModel: loadTestPlanSetFormToModel,
      setModelToForm: loadTestPlanSetModelToForm,
    });
  }

  private registerViews(): void {
    this._viewRegistry.registerView('wizards', 'partials/wizards/wizardDashboard.html');
  }

  private registerMenuItems(): void {
    this._viewRegistry.registerMenuEntry('Wizards', 'wizards', 'monitor', {
      weight: -1,
      parentId: 'automation-root',
    });
  }
}
