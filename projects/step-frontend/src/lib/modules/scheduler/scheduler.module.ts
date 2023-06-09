import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { SchedulerTaskLinkComponent } from './components/scheduler-task-link/scheduler-task-link.component';
import './components/scheduler-task-selection/scheduler-task-selection.component';
import { SchedulerTaskSelectionComponent } from './components/scheduler-task-selection/scheduler-task-selection.component';
import { ScheduledTaskListComponent } from './components/scheduled-task-list/scheduled-task-list.component';
import { SchedulerConfigurationComponent } from './components/scheduler-configuration/scheduler-configuration.component';
import './components/scheduler-configuration/scheduler-configuration.component';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  declarations: [
    ScheduledTaskListComponent,
    SchedulerTaskLinkComponent,
    SchedulerTaskSelectionComponent,
    SchedulerConfigurationComponent,
  ],
  exports: [ScheduledTaskListComponent, SchedulerTaskSelectionComponent, SchedulerConfigurationComponent],
})
export class SchedulerModule {
  constructor(_entityRegistry: EntityRegistry, _cellRegistry: CustomCellRegistryService) {
    _entityRegistry.register('tasks', 'Scheduler task', {
      icon: 'clock',
      templateUrl: '/partials/scheduler/schedulerTaskSelectionTable.html',
    });
    _cellRegistry.registerCell('schedulerTaskLink', SchedulerTaskLinkComponent);
  }
}
