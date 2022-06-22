import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { StepGeneratedClientModule } from './generated/StepGeneratedClientModule';
import { StepAugmentedClientModule } from './augmented/step-augmented-client.module';

@NgModule({
  imports: [HttpClientModule, StepGeneratedClientModule, StepAugmentedClientModule],
  exports: [StepGeneratedClientModule, StepAugmentedClientModule],
  providers: [],
})
export class StepClientModule {}

export * from './generated/index';
export * from './augmented/step-augmented-client.module';
