import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLabelComponent } from './components/resource-label/resource-label.component';
import { InputGroupComponent } from './components/input-group/input-group.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ResourceLabelComponent, InputGroupComponent],
  exports: [ResourceLabelComponent, InputGroupComponent],
})
export class StepBasicsModule {}

export * from './components/input-group/input-group.component';
export * from './components/resource-label/resource-label.component';
export * from './shared/compare-condition.enum';
