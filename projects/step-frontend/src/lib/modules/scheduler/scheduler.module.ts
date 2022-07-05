import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { ScheduledTaskListComponent } from './scheduled-task-list/scheduled-task-list.component';

@NgModule({
  declarations: [ScheduledTaskListComponent],
  exports: [ScheduledTaskListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class SchedulerModule {}
