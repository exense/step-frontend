import { ActivatedRouteSnapshot, Route } from '@angular/router';
import { dialogRoute } from '../../basics/types/dialog-route';
import { EditSchedulerTaskDialogComponent } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { inject } from '@angular/core';
import { ScheduledTaskTemporaryStorageService } from '../injectables/scheduled-task-temporary-storage.service';
import { EditSchedulerTaskDialogUtilsService } from '../injectables/edit-scheduler-task-dialog-utils.service';
import { SchedulePlanComponent } from '../components/schedule-plan/schedule-plan.component';

export const schedulePlanRoute = (outlet?: string): Route => ({
  path: 'schedule',
  outlet,
  component: SchedulePlanComponent,
  children: [
    dialogRoute({
      path: ':temporaryId',
      dialogComponent: EditSchedulerTaskDialogComponent,
      data: {
        isSchedulePlan: true,
      },
      canActivate: [
        (route: ActivatedRouteSnapshot) => {
          return inject(ScheduledTaskTemporaryStorageService).has(route.params['temporaryId']);
        },
      ],
      resolve: {
        taskAndConfig: (route: ActivatedRouteSnapshot) => {
          const temporaryId = route.params['temporaryId'];
          const task = inject(ScheduledTaskTemporaryStorageService).get(temporaryId)!;
          return inject(EditSchedulerTaskDialogUtilsService).prepareTaskAndConfig(task);
        },
      },
      canDeactivate: [
        (_: unknown, route: ActivatedRouteSnapshot) => {
          inject(ScheduledTaskTemporaryStorageService).cleanup(route.params['temporaryId']);
          return true;
        },
      ],
    }),
  ],
});
