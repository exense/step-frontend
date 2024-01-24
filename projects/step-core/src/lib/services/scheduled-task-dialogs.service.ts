import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { AugmentedSchedulerService, ExecutiontTaskParameters } from '../client/step-client-module';
import {
  EditSchedulerTaskDialogComponent,
  EditSchedulerTaskDialogConfig,
  EditSchedulerTaskDialogData,
} from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { EntityDialogsService } from '../modules/entity/injectables/entity-dialogs.service';
import { DialogsService } from '../shared';
import { AuthService } from '../modules/basics/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduledTaskDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _entityDialogs = inject(EntityDialogsService);
  private _auth = inject(AuthService);

  selectTask(): Observable<ExecutiontTaskParameters | undefined> {
    return this._entityDialogs.selectEntityOfType('tasks').pipe(
      map((result) => result?.item?.id),
      switchMap((id) => (!id ? of(undefined) : this._schedulerService.getExecutionTaskById(id)))
    );
  }

  editScheduledTask(task: ExecutiontTaskParameters): Observable<ExecutiontTaskParameters | undefined> {
    const config = this.fillScheduledTaskDialogConfig(task);

    return this._matDialog
      .open<EditSchedulerTaskDialogComponent, EditSchedulerTaskDialogData, ExecutiontTaskParameters | undefined>(
        EditSchedulerTaskDialogComponent,
        { data: { task, config }, disableClose: true }
      )
      .afterClosed();
  }

  removeScheduledTask(task: ExecutiontTaskParameters): Observable<boolean> {
    const paramName: string = task.attributes!['name']!;

    return this._dialogs.showDeleteWarning(1, `Task "${paramName}"`).pipe(
      filter((result) => result),
      switchMap(() => this._schedulerService.deleteExecutionTask(task.id!))
    );
  }

  private fillScheduledTaskDialogConfig(task: ExecutiontTaskParameters): EditSchedulerTaskDialogConfig {
    let hideUser = false;
    let disableUser = false;
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

    // TODO: Fill disablePlan flag, when it will be clarified how to fill it
    const result: EditSchedulerTaskDialogConfig = {
      hideUser,
      disableUser,
    };
    return result;
  }
}
