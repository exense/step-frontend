import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, catchError, of } from 'rxjs';
import { a1Promise2Observable, AJS_MODULE, DialogsService } from '../shared';
import { ExecutionParameters, ExecutiontTaskParameters, AugmentedSchedulerService } from '../client/step-client-module';
import { MatDialog } from '@angular/material/dialog';
import { NewSchedulerTaskDialogComponent } from '../components/new-scheduler-task-dialog/new-scheduler-task-dialog.component';
import { EditSchedulerTaskDialogComponent } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { EntityDialogsService } from '../modules/entity/services/entity-dialogs.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduledTaskDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _entityDialogs = inject(EntityDialogsService);

  selectTask(): Observable<ExecutiontTaskParameters | undefined> {
    return this._entityDialogs.selectEntityOfType('tasks', true).pipe(
      map((result) => result?.item?.id),
      switchMap((id) => (!id ? of(undefined) : this._schedulerService.getExecutionTaskById(id)))
    );
  }

  newScheduledTask(executionParams: ExecutionParameters): Observable<ExecutiontTaskParameters | undefined> {
    return this._matDialog
      .open<NewSchedulerTaskDialogComponent, ExecutionParameters, ExecutiontTaskParameters | undefined>(
        NewSchedulerTaskDialogComponent,
        { data: executionParams }
      )
      .afterClosed()
      .pipe(
        switchMap((result) => {
          if (!result) {
            return of(undefined);
          }
          return this._schedulerService.saveExecutionTask(result);
        })
      );
  }

  editScheduledTask(scheduledTask: ExecutiontTaskParameters): Observable<ExecutiontTaskParameters | undefined> {
    return this._matDialog
      .open<EditSchedulerTaskDialogComponent, ExecutiontTaskParameters, ExecutiontTaskParameters | undefined>(
        EditSchedulerTaskDialogComponent,
        { data: scheduledTask, disableClose: true }
      )
      .afterClosed();
  }

  removeScheduledTask(task: ExecutiontTaskParameters): Observable<boolean> {
    const paramName: string = task.attributes!['name']!;
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Task "${paramName}"`)).pipe(
      switchMap(() => this._schedulerService.deleteExecutionTask(task.id!)),
      map(() => true),
      catchError(() => of(false))
    );
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('ScheduledTaskDialogsService', downgradeInjectable(ScheduledTaskDialogsService));
