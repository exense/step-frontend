import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { StepGeneratedClientModule } from '../generated';

@NgModule({
  imports: [HttpClientModule, StepGeneratedClientModule],
  providers: [],
})
export class StepAugmentedClientModule {}

export type { ExecutionSummaryDto } from './models/execution-summary-dto';

export { AugmentedPlansService } from './services/augmented-plans-service';
export { AugmentedExecutionsService } from './services/augmented-executions-service';
export { AugmentedParametersService } from './services/augmented-parameters-service';
export { AugmentedResourcesService } from './services/augmented-resources-service';
