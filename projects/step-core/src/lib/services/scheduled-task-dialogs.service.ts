import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, catchError, of } from 'rxjs';
import { UibModalHelperService } from './uib-modal-helper.service';
import { a1Promise2Observable, DialogsService } from '../shared';
import { ExecutiontTaskParameters, SchedulerService } from '../client/generated';

@Injectable({
  providedIn: 'root',
})
export class ScheduledTaskDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _schedulerService: SchedulerService
  ) {}

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
