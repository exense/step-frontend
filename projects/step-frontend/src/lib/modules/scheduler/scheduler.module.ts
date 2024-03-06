import { inject, NgModule } from '@angular/core';
import {
  AugmentedSchedulerService,
  checkProjectGuardFactory,
  CommonEditorUrlsService,
  CustomCellRegistryService,
  dialogRoute,
  EditSchedulerTaskDialogComponent,
  EntityRegistry,
  ScheduledTaskDialogsService,
  SchedulerActionsService,
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
import { ScheduledTaskLogicService } from './services/scheduled-task-logic.service';
import { ScheduledTaskBulkOperationsRegisterService } from './services/scheduled-task-bulk-operations-register.service';
import { CronExpressionCellComponent } from './components/cron-expression-cell/cron-expression-cell.component';
import { map } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TaskUrlPipe } from './pipes/task-url.pipe';

@NgModule({
  imports: [StepCoreModule, StepCommonModule],
  declarations: [
    ScheduledTaskListComponent,
    SchedulerTaskSelectionComponent,
    SchedulerConfigurationComponent,
    CronExpressionCellComponent,
    TaskUrlPipe,
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
                  const _dialogs = inject(ScheduledTaskDialogsService);
                  return _api.createExecutionTask().pipe(map((task) => _dialogs.prepareTaskAndConfig(task)));
                },
              },
            }),
            dialogRoute({
              path: ':id',
              dialogComponent: EditSchedulerTaskDialogComponent,
              canActivate: [
                checkProjectGuardFactory({
                  entityType: 'task',
                  getEntity: (id) => inject(AugmentedSchedulerService).getExecutionTaskByIdCached(id),
                  getEditorUrl: (id) => inject(CommonEditorUrlsService).schedulerTaskEditorUrl(id),
                }),
              ],
              resolve: {
                taskAndConfig: (route: ActivatedRouteSnapshot) => {
                  const taskId = route.params['id'];
                  const _api = inject(AugmentedSchedulerService);
                  const _dialogs = inject(ScheduledTaskDialogsService);
                  return _api
                    .getExecutionTaskByIdCached(taskId)
                    .pipe(map((task) => _dialogs.prepareTaskAndConfig(task)));
                },
              },
              canDeactivate: [() => inject(AugmentedSchedulerService).cleanupCache()],
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
