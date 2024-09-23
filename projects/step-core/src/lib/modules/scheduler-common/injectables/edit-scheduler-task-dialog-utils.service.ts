import { inject, Injectable } from '@angular/core';
import { AugmentedPlansService, ExecutiontTaskParameters } from '../../../client/step-client-module';
import { EditSchedulerTaskDialogData } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { AuthService } from '../../auth';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditSchedulerTaskDialogUtilsService {
  private _auth = inject(AuthService);
  private _planApi = inject(AugmentedPlansService);

  prepareTaskAndConfig(task: ExecutiontTaskParameters): Observable<EditSchedulerTaskDialogData['taskAndConfig']> {
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

    return this._planApi.getPlanById(planId).pipe(
      map((plan) => ({
        task,
        // TODO: Fill disablePlan flag, when it will be clarified how to fill it
        config: { hideUser, disableUser, plan },
      })),
    );
  }
}
