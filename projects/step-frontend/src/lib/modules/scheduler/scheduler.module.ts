import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { SchedulerIconComponent } from './components/scheduler-icon/scheduler-icon.component';
import { SchedulerTaskLinkComponent } from './components/scheduler-task-link/scheduler-task-link.component';
import './components/scheduler-task-selection/scheduler-task-selection.component';
import { SchedulerTaskSelectionComponent } from './components/scheduler-task-selection/scheduler-task-selection.component';
import { ScheduledTaskListComponent } from './scheduled-task-list/scheduled-task-list.component';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  declarations: [
    ScheduledTaskListComponent,
    SchedulerIconComponent,
    SchedulerTaskLinkComponent,
    SchedulerTaskSelectionComponent,
  ],
  exports: [ScheduledTaskListComponent, SchedulerTaskSelectionComponent],
})
export class SchedulerModule {
  constructor(_entityRegistry: EntityRegistry, _cellRegistry: CustomCellRegistryService) {
    _entityRegistry.register('tasks', 'Scheduler task', {
      icon: 'clock',
      templateUrl: '/partials/scheduler/schedulerTaskSelectionTable.html',
    });
    _cellRegistry.registerCell('taskEntityIcon', SchedulerIconComponent);
    _cellRegistry.registerCell('schedulerTaskLink', SchedulerTaskLinkComponent);
  }
}
