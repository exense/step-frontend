import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { CustomRegistriesModule } from '../custom-registeries/custom-registries.module';
import { WizardStepsComponent } from './components/wizard-steps/wizard-steps.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WizardContextConnectorDirective } from './directives/wizard-context-connector.directive';
import { WizardDefaultButtonsComponent } from './components/wizard-default-buttons/wizard-default-buttons.component';
import { WizardDialogComponent } from './components/wizard-dialog/wizard-dialog.component';
import { WizardButtonsDirective } from './directives/wizard-buttons.directive';
import { WizardStepComponent } from './components/wizard-step/wizard-step.component';

@NgModule({
  declarations: [
    WizardStepsComponent,
    WizardContextConnectorDirective,
    WizardDefaultButtonsComponent,
    WizardDialogComponent,
    WizardButtonsDirective,
    WizardStepComponent,
  ],
  imports: [
    CommonModule,
    StepBasicsModule,
    StepMaterialModule,
    CustomRegistriesModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [WizardDialogComponent, WizardButtonsDirective, WizardStepComponent, WizardDefaultButtonsComponent],
})
export class WizardModule {}

export * from './components/wizard-steps/wizard-steps.component';
export * from './components/wizard-default-buttons/wizard-default-buttons.component';
export * from './components/wizard-dialog/wizard-dialog.component';
export * from './components/wizard-step/wizard-step.component';
export * from './directives/wizard-buttons.directive';
export * from './directives/wizard-context-connector.directive';
export * from './injectables/wizard-global-context.token';
export * from './injectables/wizard-step-local-context.token';
export * from './injectables/wizard-step-type.token';
export * from './injectables/wizard-step-form.token';
export * from './injectables/wizard-step-registry.service';
export * from './injectables/wizard-dialog.service';
export * from './injectables/wizard-step-behavior-config.token';
export * from './injectables/wizard-step-form-config.token';
export * from './injectables/wizard-step-actions.service';
export * from './types/wizard-global-context.interface';
export * from './types/wizard-step.interface';
export * from './types/wizard-step-local-context.interface';
export * from './types/wizard-step-meta.interface';
export * from './types/wizard-step-behavior-config.interface';
export * from './types/wizard-step-form-config.interface';
