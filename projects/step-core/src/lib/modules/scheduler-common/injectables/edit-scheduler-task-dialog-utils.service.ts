import { inject, Injectable } from '@angular/core';
import {
  AugmentedPlansService,
  ExecutiontTaskParameters,
  ForbiddenResponse,
  httpOverrideForbiddenResponse,
  Plan,
} from '../../../client/step-client-module';
import { EditSchedulerTaskDialogData } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { AuthService } from '../../auth';
import { catchError, map, Observable, of, throwError } from 'rxjs';

type TaskAndConfig = EditSchedulerTaskDialogData['taskAndConfig'];

@Injectable({
  providedIn: 'root',
})
export class EditSchedulerTaskDialogUtilsService {
  private _auth = inject(AuthService);
  private _planApi = inject(AugmentedPlansService);

  prepareTaskAndConfig(task: ExecutiontTaskParameters): Observable<TaskAndConfig> {
    let hideUser = false;
    let disableUser = false;
    if (!this._auth.isAuthenticated()) {
      hideUser = true;
      task.executionsParameters!.userID = this._auth.getUserID();
    } else {
      const hasRightOnBehalfOf = this._auth.hasRight('on-behalf-of');

      if (!task.id) {
        // New task case.
        // Hide user field if there is no right, otherwise prefill the field
        if (!hasRightOnBehalfOf) {
          hideUser = true;
        } else {
          task.executionsParameters!.userID = this._auth.getUserID();
        }
      } else {
        // Existing task case
        // If there is no right hide user field, if it is empty, otherwise disable it
        if (!hasRightOnBehalfOf) {
          hideUser = !task.executionsParameters?.userID;
          disableUser = !!task.executionsParameters?.userID;
        }
      }
    }

    const repositoryObject = task?.executionsParameters?.repositoryObject;
    const repositoryId = repositoryObject?.repositoryID ?? 'local';
    const repositoryParameters = repositoryObject?.repositoryParameters ?? {};
    const planId = repositoryId === 'local' ? repositoryParameters?.['planid'] : undefined;
    if (!planId) {
      // TODO: Fill disablePlan flag, when it will be clarified how to fill it
      return of({ task, config: { hideUser, disableUser } });
    }

    return this._planApi
      .overrideInterceptor(httpOverrideForbiddenResponse())
      .getPlanById(planId)
      .pipe(
        map((planOrForbidden: Plan | ForbiddenResponse | undefined) => {
          const forbidden = (planOrForbidden as ForbiddenResponse | undefined)?.forbidden;
          if (forbidden) {
            return {
              plan: {
                attributes: {
                  name: 'Can not access to selected plan',
                },
              } as Partial<Plan>,
              forbiddenPlanError: forbidden,
              missingPlanReference: false,
            };
          }

          if (!planOrForbidden) {
            this.removePlanReference(task);
            return {
              plan: undefined,
              forbiddenPlanError: undefined,
              missingPlanReference: true,
            };
          }

          return { plan: planOrForbidden as Plan, forbiddenPlanError: undefined, missingPlanReference: false };
        }),
        map(
          ({ plan, forbiddenPlanError, missingPlanReference }) =>
            ({
              task,
              // TODO: Fill disablePlan flag, when it will be clarified how to fill it
              config: { hideUser, disableUser, plan, forbiddenPlanError, missingPlanReference },
            }) as TaskAndConfig,
        ),
        catchError((error: unknown) => {
          const status = (error as { status?: number })?.status;
          if (status !== 404) {
            return throwError(() => error);
          }

          this.removePlanReference(task);

          return of({
            task,
            config: {
              hideUser,
              disableUser,
              missingPlanReference: true,
            },
          } satisfies TaskAndConfig);
        }),
      );
  }

  private removePlanReference(task: ExecutiontTaskParameters): void {
    const repositoryObject = task.executionsParameters?.repositoryObject;
    if (repositoryObject?.repositoryID !== 'local') {
      return;
    }

    delete repositoryObject.repositoryParameters?.['planid'];
    task.executionsParameters!.description = undefined;
  }
}
