import { NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  EntityRegistry,
  SchedulerActionsService,
  SchedulerTaskLinkComponent,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import './components/scheduler-task-selection/scheduler-task-selection.component';
import { SchedulerTaskSelectionComponent } from './components/scheduler-task-selection/scheduler-task-selection.component';
import { ScheduledTaskListComponent } from './components/scheduled-task-list/scheduled-task-list.component';
import { SchedulerConfigurationComponent } from './components/scheduler-configuration/scheduler-configuration.component';
import './components/scheduler-configuration/scheduler-configuration.component';
import { ScheduledTaskLogicService } from './services/scheduled-task-logic.service';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  declarations: [ScheduledTaskListComponent, SchedulerTaskSelectionComponent, SchedulerConfigurationComponent],
  exports: [ScheduledTaskListComponent, SchedulerTaskSelectionComponent, SchedulerConfigurationComponent],
  providers: [
    {
      provide: SchedulerActionsService,
      useClass: ScheduledTaskLogicService,
    },
  ],
})
export class SchedulerModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _cellRegistry: CustomCellRegistryService,
    private _viewRegistry: ViewRegistryService
  ) {
    this.registerEntity();
    this.registerCells();
    this.registerViews();
    this.registerDashlets();
  }

  private registerEntity(): void {
    this._entityRegistry.register('tasks', 'Scheduler task', {
      icon: 'clock',
      component: SchedulerTaskSelectionComponent,
    });
  }

  private registerCells(): void {
    this._cellRegistry.registerCell('schedulerTaskLink', SchedulerTaskLinkComponent);
  }

  private registerViews(): void {
    this._viewRegistry.registerView('scheduler', 'partials/scheduler.html');
  }

  private registerDashlets(): void {
    this._viewRegistry.registerDashlet(
      'admin/controller',
      'Scheduler',
      'partials/scheduler/schedulerConfiguration.html',
      'scheduler',
      false,
      1
    );
    this._viewRegistry.registerDashlet(
      'settings',
      'Scheduler',
      'partials/scheduler/schedulerConfiguration.html',
      'scheduler',
      false,
      1
    );
  }
}
