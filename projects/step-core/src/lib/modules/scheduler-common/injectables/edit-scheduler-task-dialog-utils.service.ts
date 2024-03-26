import { inject, Injectable } from '@angular/core';
import { ExecutiontTaskParameters } from '../../../client/step-client-module';
import {
  EditSchedulerTaskDialogConfig,
  EditSchedulerTaskDialogData,
} from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root',
})
export class EditSchedulerTaskDialogUtilsService {
  private _auth = inject(AuthService);

  prepareTaskAndConfig(task: ExecutiontTaskParameters): EditSchedulerTaskDialogData['taskAndConfig'] {
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

    // TODO: Fill disablePlan flag, when it will be clarified how to fill it
    const config: EditSchedulerTaskDialogConfig = {
      hideUser,
      disableUser,
    };
    return { task, config };
  }
}
