import { inject, NgModule } from '@angular/core';
import {
  AugmentedSchedulerService,
  CommonEntitiesUrlsService,
  CustomCellRegistryService,
  dialogRoute,
  editScheduledTaskRoute,
  EditSchedulerTaskDialogComponent,
  EntityRegistry,
  EditSchedulerTaskDialogUtilsService,
  SchedulerTaskLinkComponent,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import './components/scheduler-task-selection/scheduler-task-selection.component';
import { SchedulerTaskSelectionComponent } from './components/scheduler-task-selection/scheduler-task-selection.component';
import { ScheduledTaskListComponent } from './components/scheduled-task-list/scheduled-task-list.component';
import { SchedulerConfigurationComponent } from './components/scheduler-configuration/scheduler-configuration.component';
import './components/scheduler-configuration/scheduler-configuration.component';
import { ScheduledTaskBulkOperationsRegisterService } from './services/scheduled-task-bulk-operations-register.service';
import { CronExpressionCellComponent } from './components/cron-expression-cell/cron-expression-cell.component';
import { map } from 'rxjs';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  declarations: [
    ScheduledTaskListComponent,
    SchedulerTaskSelectionComponent,
    SchedulerConfigurationComponent,
    CronExpressionCellComponent,
  ],
  exports: [ScheduledTaskListComponent, SchedulerTaskSelectionComponent, SchedulerConfigurationComponent],
})
export class SchedulerModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _cellRegistry: CustomCellRegistryService,
    private _viewRegistry: ViewRegistryService,
    _taskBulkOperations: ScheduledTaskBulkOperationsRegisterService,
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
      children: [
        {
          path: 'editor',
          component: SimpleOutletComponent,
          children: [
            dialogRoute({
              path: 'new',
              dialogComponent: EditSchedulerTaskDialogComponent,
              resolve: {
                taskAndConfig: () => {
                  const _api = inject(AugmentedSchedulerService);
                  const _dialogs = inject(EditSchedulerTaskDialogUtilsService);
                  return _api.createExecutionTask().pipe(map((task) => _dialogs.prepareTaskAndConfig(task)));
                },
              },
            }),
            editScheduledTaskRoute({
              path: ':id',
              getEditorUrl: (id) => inject(CommonEntitiesUrlsService).schedulerTaskEditorUrl(id),
            }),
          ],
        },
      ],
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
        },
      );
    };
    register('settings');
    register('admin/controller');
  }
}
