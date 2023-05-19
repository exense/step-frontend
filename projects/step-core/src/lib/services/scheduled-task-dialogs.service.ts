import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, catchError, of } from 'rxjs';
import { UibModalHelperService } from './uib-modal-helper.service';
import { a1Promise2Observable, DialogsService } from '../shared';
import { ExecutionParameters, ExecutiontTaskParameters, SchedulerService } from '../client/generated';
import { MatDialog } from '@angular/material/dialog';
import { NewSchedulerTaskDialogComponent } from '../components/new-scheduler-task-dialog/new-scheduler-task-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ScheduledTaskDialogsService {
  private _matDialog = inject(MatDialog);
  private _uibModalHelper = inject(UibModalHelperService);
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

  editScheduledTask(
    scheduledTask?: Partial<ExecutiontTaskParameters>
  ): Observable<{ scheduledTask?: Partial<ExecutiontTaskParameters>; result: string }> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/scheduler/editSchedulerTaskDialog.html',
      controller: 'editSchedulerTaskModalCtrl',
      resolve: {
        task: function (): any {
          return scheduledTask;
        },
      },
    });
    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;
    return result$.pipe(map((result) => ({ result, scheduledTask: scheduledTask })));
  }

  removeScheduledTask(task: ExecutiontTaskParameters): Observable<any> {
    const paramName: string = task.attributes!['name']!;
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Task "${paramName}"`)).pipe(
      switchMap((_) => this._schedulerService.deleteExecutionTask(task.id!)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
