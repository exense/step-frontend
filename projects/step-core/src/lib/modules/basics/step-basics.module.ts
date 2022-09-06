import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLabelComponent } from './components/resource-label/resource-label.component';
import { StepSpinnerComponent } from './components/step-spinner/step-spinner.component';
import { StepMaterialModule } from '../step-material/step-material.module';

@NgModule({
  imports: [CommonModule, StepMaterialModule],
  declarations: [ResourceLabelComponent, StepSpinnerComponent],
  exports: [ResourceLabelComponent, StepSpinnerComponent],
})
export class StepBasicsModule {}

export * from './components/resource-label/resource-label.component';
export * from './components/step-spinner/step-spinner.component';
