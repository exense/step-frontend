import { NgModule } from '@angular/core';
import { OperationComponent } from './components/operation/operation.component';
import { StepCoreModule } from '@exense/step-core';
import { CurrentOperationsComponent } from './components/current-operations/current-operations.component';

@NgModule({
  declarations: [OperationComponent, CurrentOperationsComponent],
  imports: [StepCoreModule],
  exports: [CurrentOperationsComponent, OperationComponent],
})
export class OperationsModule {}

export * from './shared/execution-view-services';
