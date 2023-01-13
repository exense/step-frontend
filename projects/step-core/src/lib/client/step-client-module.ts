import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { StepGeneratedClientModule } from './generated/StepGeneratedClientModule';
import { StepAugmentedClientModule } from './augmented/step-augmented-client.module';
import { StepTableClientModule } from './table/step-table-client.module';

@NgModule({
  imports: [HttpClientModule, StepGeneratedClientModule, StepAugmentedClientModule, StepTableClientModule],
  exports: [StepGeneratedClientModule, StepAugmentedClientModule, StepTableClientModule],
  providers: [],
})
export class StepClientModule {}

export * from './generated/core/BaseHttpRequest';
export { ApiError } from './generated/core/ApiError';
export * from './generated/index';
export * from './augmented/step-augmented-client.module';
export * from './table/step-table-client.module';
