import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { StepClientModule } from '../generated';

@NgModule({
  imports: [HttpClientModule, StepClientModule],
  providers: [],
})
export class AugmentedStepClientModule {}

export { AugmentedPlansService } from './services/augmented-plans-service';
