import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { CustomCellRegistryService, EntityRegistry, StepCoreModule } from '@exense/step-core';
import { ScheduledTaskListComponent } from './scheduled-task-list/scheduled-task-list.component';
import { SchedulerIconComponent } from './components/scheduler-icon/scheduler-icon.component';
import { SchedulerTaskLinkComponent } from './components/scheduler-task-link/scheduler-task-link.component';

@NgModule({
  declarations: [ScheduledTaskListComponent, SchedulerIconComponent, SchedulerTaskLinkComponent],
  exports: [ScheduledTaskListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class SchedulerModule {
  constructor(_entityRegistry: EntityRegistry, _cellRegistry: CustomCellRegistryService) {
    _entityRegistry.register(
      'tasks',
      'Scheduler task',
      'schedule',
      '/partials/scheduler/schedulerTaskSelectionTable.html'
    );
    _cellRegistry.registerCell('taskEntityIcon', SchedulerIconComponent);
    _cellRegistry.registerCell('schedulerTaskLink', SchedulerTaskLinkComponent);
  }
}
