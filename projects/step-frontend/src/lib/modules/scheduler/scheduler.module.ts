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
import { ScheduledTaskBulkOperationsRegisterService } from './services/scheduled-task-bulk-operations-register.service';

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
    private _viewRegistry: ViewRegistryService,
    _taskBulkOperations: ScheduledTaskBulkOperationsRegisterService
  ) {
    this.registerEntity();
    this.registerCells();
    this.registerViews();
    this.registerSettings();
    _taskBulkOperations.register();
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
    this._viewRegistry.registerRoute({
      path: 'scheduler',
      component: ScheduledTaskListComponent,
    });
  }

  private registerSettings(): void {
    const register = (parentPath: string) => {
      this._viewRegistry.registerRoute(
        {
          path: 'scheduler',
          component: SchedulerConfigurationComponent,
        },
        {
          parentPath,
          label: 'Scheduler',
          weight: 0,
          accessPermissions: ['settings-ui-menu', 'admin-ui-menu'],
        }
      );
    };
    register('settings');
    register('admin/controller');
  }
}
