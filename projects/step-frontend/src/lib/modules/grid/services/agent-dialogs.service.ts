import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ExecutiontTaskParameters,
  UibModalHelperService,
  a1Promise2Observable,
  DialogsService,
  SchedulerService,
} from '@exense/step-core';
import { pipe, map, Observable, switchMap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentDialogsService {
  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _schedulerService: SchedulerService
  ) {}

  editAgent(
    agent?: Partial<ExecutiontTaskParameters>
  ): Observable<{ agent?: Partial<ExecutiontTaskParameters>; result: string }> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/scheduler/editSchedulerTaskDialog.html',
      controller: 'editSchedulerTaskModalCtrl',
      resolve: {
        task: function (): any {
          return agent;
        },
      },
    });
    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;
    return result$.pipe(map((result) => ({ result, agent: agent })));
  }

  removeAgent(task: ExecutiontTaskParameters): Observable<any> {
    const paramName: string = task.attributes!['name']!;
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Task "${paramName}"`)).pipe(
      switchMap((_) => this._schedulerService.removeExecutionTask(task.id!, true)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
