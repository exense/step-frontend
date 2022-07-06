import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLabelComponent } from './components/resource-label/resource-label.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ResourceLabelComponent],
  exports: [ResourceLabelComponent],
})
export class StepBasicsModule {}

export * from './components/resource-label/resource-label.component';
