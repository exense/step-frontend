import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, catchError, of } from 'rxjs';
import { a1Promise2Observable, AJS_MODULE, DialogsService } from '../shared';
import { ExecutionParameters, ExecutiontTaskParameters, SchedulerService } from '../client/generated';
import { MatDialog } from '@angular/material/dialog';
import { NewSchedulerTaskDialogComponent } from '../components/new-scheduler-task-dialog/new-scheduler-task-dialog.component';
import { EditSchedulerTaskDialogComponent } from '../components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';

@Injectable({
  providedIn: 'root',
})
export class ScheduledTaskDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _schedulerService = inject(SchedulerService);

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
      switchMap((_) => this._schedulerService.deleteExecutionTask(task.id!)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('ScheduledTaskDialogsService', downgradeInjectable(ScheduledTaskDialogsService));
