import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './components/tabs/tabs.component';
import { StepMaterialModule } from '../step-material/step-material.module';
import './components/tabs/tabs.component';

@NgModule({
  declarations: [TabsComponent],
  imports: [StepMaterialModule, CommonModule],
  exports: [TabsComponent],
})
export class TabsModule {}

export * from './shared/tab';
export * from './components/tabs/tabs.component';
