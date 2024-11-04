import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { StepGeneratedClientModule } from './generated/StepGeneratedClientModule';
import { StepAugmentedClientModule } from './augmented/step-augmented-client.module';
import { StepTableClientModule } from './table/step-table-client.module';

@NgModule({
  exports: [StepGeneratedClientModule, StepAugmentedClientModule, StepTableClientModule],
  imports: [StepGeneratedClientModule, StepAugmentedClientModule, StepTableClientModule],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class StepClientModule {}

export * from './generated/core/BaseHttpRequest';
export { ApiError } from './generated/core/ApiError';
export * from './generated/index';
export * from './async-task/async-task.module';
export * from './augmented/step-augmented-client.module';
export * from './table/step-table-client.module';
