import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';
import { dialogRoute } from '../../basics/types/dialog-route';
import { EditSchedulerTaskDialogComponent } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { checkEntityGuardFactory, CheckProjectGuardConfig } from '../../../guards/check-entity-guard.factory';
import { inject } from '@angular/core';
import { AugmentedSchedulerService } from '../../../client/augmented/services/augmented-scheduler.service';
import { EditSchedulerTaskDialogUtilsService } from '../injectables/edit-scheduler-task-dialog-utils.service';
import { switchMap } from 'rxjs';
import { MultipleProjectsService } from '../../basics/injectables/multiple-projects.service';

export const editScheduledTaskRoute = ({
  path,
  getEditorUrl,
  idExtractor,
  getListUrl,
  isMatchEditorUrl,
  outlet,
}: {
  path: string;
  getEditorUrl: CheckProjectGuardConfig['getEditorUrl'];
  idExtractor?: CheckProjectGuardConfig['idExtractor'];
  getListUrl?: CheckProjectGuardConfig['getListUrl'];
  isMatchEditorUrl?: CheckProjectGuardConfig['isMatchEditorUrl'];
  outlet?: string;
}): Route =>
  dialogRoute({
    path,
    outlet,
    dialogComponent: EditSchedulerTaskDialogComponent,
    canActivate: [
      checkEntityGuardFactory({
        entityType: 'task',
        idExtractor,
        getEntity: (id) => {
          const _schedulerService = inject(AugmentedSchedulerService);
          const task = _schedulerService.getExecutionTaskByIdCached(id);
          return task;
        },
        getEditorUrl,
        getListUrl,
        isMatchEditorUrl,
      }),
    ],
    resolve: {
      taskAndConfig: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const _api = inject(AugmentedSchedulerService);
        const _dialogs = inject(EditSchedulerTaskDialogUtilsService);
        const taskId = idExtractor ? idExtractor(route, state) : route.params['id'];
        return _api.getExecutionTaskByIdCached(taskId).pipe(switchMap((task) => _dialogs.prepareTaskAndConfig(task)));
      },
    },
    canDeactivate: [
      () => {
        inject(MultipleProjectsService).cleanupProjectMessage();
        inject(AugmentedSchedulerService).cleanupCache();
      },
    ],
  });
