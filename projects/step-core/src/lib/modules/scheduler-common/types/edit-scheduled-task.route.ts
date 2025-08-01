import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';
import { dialogRoute } from '../../basics/types/dialog-route';
import { EditSchedulerTaskDialogComponent } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { checkEntityGuardFactory, CheckProjectGuardConfig } from '../../../guards/check-entity-guard.factory';
import { inject, Injector } from '@angular/core';
import { AugmentedSchedulerService } from '../../../client/augmented/services/augmented-scheduler.service';
import { EditSchedulerTaskDialogUtilsService } from '../injectables/edit-scheduler-task-dialog-utils.service';
import { map, switchMap } from 'rxjs';

export const editScheduledTaskRoute = ({
  path,
  getEditorUrl,
  idExtractor,
  outlet,
}: {
  path: string;
  getEditorUrl: CheckProjectGuardConfig['getEditorUrl'];
  idExtractor?: CheckProjectGuardConfig['idExtractor'];
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
    canDeactivate: [() => inject(AugmentedSchedulerService).cleanupCache()],
  });
