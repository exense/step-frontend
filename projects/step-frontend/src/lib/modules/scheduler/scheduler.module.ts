import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, SchedulerActionsService, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { SchedulerTaskLinkComponent } from './components/scheduler-task-link/scheduler-task-link.component';
import './components/scheduler-task-selection/scheduler-task-selection.component';
import { SchedulerTaskSelectionComponent } from './components/scheduler-task-selection/scheduler-task-selection.component';
import { ScheduledTaskListComponent } from './components/scheduled-task-list/scheduled-task-list.component';
import { SchedulerConfigurationComponent } from './components/scheduler-configuration/scheduler-configuration.component';
import './components/scheduler-configuration/scheduler-configuration.component';
import { ScheduledTaskLogicService } from './services/scheduled-task-logic.service';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  declarations: [
    ScheduledTaskListComponent,
    SchedulerTaskLinkComponent,
    SchedulerTaskSelectionComponent,
    SchedulerConfigurationComponent,
  ],
  exports: [ScheduledTaskListComponent, SchedulerTaskSelectionComponent, SchedulerConfigurationComponent],
  providers: [
    {
      provide: SchedulerActionsService,
      useClass: ScheduledTaskLogicService,
    },
  ],
})
export class SchedulerModule {
  constructor(_entityRegistry: EntityRegistry, _cellRegistry: CustomCellRegistryService) {
    _entityRegistry.register('tasks', 'Scheduler task', {
      icon: 'clock',
      component: SchedulerTaskSelectionComponent,
    });
    _cellRegistry.registerCell('schedulerTaskLink', SchedulerTaskLinkComponent);
  }
}
