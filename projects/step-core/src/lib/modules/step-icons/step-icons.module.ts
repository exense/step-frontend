import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIconComponent } from './components/step-icon/step-icon.component';

@NgModule({
  declarations: [
    StepIconComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StepIconComponent
  ]
})
export class StepIconsModule { }
export { StepIconComponent } from './components/step-icon/step-icon.component';
