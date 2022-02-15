import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, HttpClientModule],
  exports: [CommonModule, FormsModule, HttpClientModule],
})
export class StepCoreModule {}

export * from './services/auth.service';
export * from './shared/angularjs-providers';
export * from './shared/constants';
export * from './domain';
export * from './shared/view-registry.service';
