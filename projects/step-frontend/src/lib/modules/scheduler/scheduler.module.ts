import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { ExecutionTaskParametersListComponent } from './execution-task-parameters-list/execution-task-parameters-list.component';

@NgModule({
  declarations: [ExecutionTaskParametersListComponent],
  exports: [ExecutionTaskParametersListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class SchedulerModule {}
