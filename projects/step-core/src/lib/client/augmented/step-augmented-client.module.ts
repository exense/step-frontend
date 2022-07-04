import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { StepGeneratedClientModule } from '../generated';

@NgModule({
  imports: [HttpClientModule, StepGeneratedClientModule],
  providers: [],
})
export class StepAugmentedClientModule {}

export { AugmentedPlansService } from './services/augmented-plans-service';
