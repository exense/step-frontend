import { NgModule } from '@angular/core';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import { CustomRegistriesModule } from '../custom-registeries/custom-registries.module';
import { WizardStepsComponent } from './components/wizard-steps/wizard-steps.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WizardLocalContextDirective } from './directives/wizard-local-context.directive';
import { CommonModule } from '@angular/common';
import { WizardStepButtonsComponent } from './components/wizard-step-buttons/wizard-step-buttons.component';
import { WizardDialogComponent } from './components/wizard-dialog/wizard-dialog.component';

@NgModule({
  declarations: [WizardStepsComponent, WizardLocalContextDirective, WizardStepButtonsComponent, WizardDialogComponent],
  imports: [
    CommonModule,
    StepBasicsModule,
    StepMaterialModule,
    CustomRegistriesModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [WizardDialogComponent],
})
export class WizardModule {}

export * from './components/wizard-steps/wizard-steps.component';
export * from './components/wizard-step-buttons/wizard-step-buttons.component';
export * from './components/wizard-dialog/wizard-dialog.component';
export * from './injectables/wizard-global-context.token';
export * from './injectables/wizard-step-local-context.token';
export * from './injectables/wizard-step-behavior.service';
export * from './injectables/wizard-step-form.service';
export * from './injectables/wizard-step-registry.service';
export * from './injectables/wizard-dialog.service';
export * from './types/wizard-global-context.interface';
export * from './types/wizard-step.interface';
export * from './types/wizard-step-local-context.interface';
export * from './types/wizard-step-meta.interface';
