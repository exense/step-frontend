import { ActivatedRouteSnapshot, Route } from '@angular/router';
import { dialogRoute } from '../../basics/types/dialog-route';
import { EditSchedulerTaskDialogComponent } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { checkEntityGuardFactory } from '../../../guards/check-entity-guard.factory';
import { inject } from '@angular/core';
import { AugmentedSchedulerService } from '../../../client/augmented/services/augmented-scheduler.service';
import { EditSchedulerTaskDialogUtilsService } from '../injectables/edit-scheduler-task-dialog-utils.service';
import { map, switchMap } from 'rxjs';

export const editScheduledTaskRoute = ({
  path,
  getEditorUrl,
}: {
  path: string;
  getEditorUrl: (id: string) => string;
}): Route =>
  dialogRoute({
    path,
    dialogComponent: EditSchedulerTaskDialogComponent,
    canActivate: [
      checkEntityGuardFactory({
        entityType: 'task',
        getEntity: (id) => inject(AugmentedSchedulerService).getExecutionTaskByIdCached(id),
        getEditorUrl,
      }),
    ],
    resolve: {
      taskAndConfig: (route: ActivatedRouteSnapshot) => {
        const taskId = route.params['id'];
        const _api = inject(AugmentedSchedulerService);
        const _dialogs = inject(EditSchedulerTaskDialogUtilsService);
        return _api.getExecutionTaskByIdCached(taskId).pipe(switchMap((task) => _dialogs.prepareTaskAndConfig(task)));
      },
    },
    canDeactivate: [() => inject(AugmentedSchedulerService).cleanupCache()],
  });
