import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { CustomCellRegistryService, EntityRegistryService, StepCoreModule } from '@exense/step-core';
import { ScheduledTaskListComponent } from './scheduled-task-list/scheduled-task-list.component';
import { SchedulerIconComponent } from './components/scheduler-icon/scheduler-icon.component';
import { SchedulerTaskLinkComponent } from './components/scheduler-task-link/scheduler-task-link.component';

@NgModule({
  declarations: [ScheduledTaskListComponent, SchedulerIconComponent, SchedulerTaskLinkComponent],
  exports: [ScheduledTaskListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class SchedulerModule {
  constructor(_entityRegistry: EntityRegistryService, _cellRegistry: CustomCellRegistryService) {
    _entityRegistry.register('tasks', 'Scheduler task', undefined, SchedulerIconComponent);
    _cellRegistry.registerCell('taskEntityIcon', SchedulerIconComponent);
    _cellRegistry.registerCell('schedulerTaskLink', SchedulerTaskLinkComponent);
  }
}
