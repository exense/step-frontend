import { inject, Injectable } from '@angular/core';
import {
  AugmentedSchedulerService,
  DialogParentService,
  DialogRouteResult,
  EditorResolverService,
  ExecutiontTaskParameters,
  MultipleProjectsService,
  ScheduledTaskDialogsService,
  SchedulerActionsService,
} from '@exense/step-core';
import { map, Observable, of, pipe, switchMap, take, tap } from 'rxjs';
import { Router } from '@angular/router';

const TASK_ID = 'taskId';
const ROOT_URL = '/scheduler';

@Injectable()
export class ScheduledTaskLogicService implements SchedulerActionsService, DialogParentService {
  private _schedulerService = inject(AugmentedSchedulerService);
  private _scheduledTaskDialogs = inject(ScheduledTaskDialogsService);
  private _router = inject(Router);
  private _multipleProjectList = inject(MultipleProjectsService);
  private _editorResolver = inject(EditorResolverService);

  private updateDataSourceAfterChange = pipe(
    tap((result?: DialogRouteResult) => {
      if (result?.isSuccess) {
        this.dataSource.reload();
      }
    }),
  );

  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';
  readonly STATUS: ReadonlyArray<string> = [this.STATUS_ACTIVE_STRING, this.STATUS_INACTIVE_STRING];

  readonly dataSource = this._schedulerService.createSelectionDataSource();
  readonly returnParentUrl = ROOT_URL;
  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  isSchedulerEnabled(): Observable<boolean> {
    return this._schedulerService.isSchedulerEnabled();
  }

  executeTask(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService.executeTask(scheduledTask.id!).subscribe((executionId) => {
      this._router.navigate(['executions', executionId]);
    });
  }

  switchActive(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService
      .getExecutionTaskById(scheduledTask.id!)
      .pipe(
        tap((task) => {
          // switching task status in GUI immediately, note that this will be overwritten by updateDataSourceAfterChange
          scheduledTask.active = !task.active;
          return task;
        }),
        switchMap((task) =>
          task.active
            ? this._schedulerService.enableExecutionTask(task.id!, false)
            : this._schedulerService.enableExecutionTask(task.id!, true),
        ),
        this.updateDataSourceAfterChange,
      )
      .subscribe();
  }

  deleteTask(scheduledTask: ExecutiontTaskParameters): void {
    this._scheduledTaskDialogs
      .removeScheduledTask(scheduledTask)
      .pipe(
        map((isSuccess) => ({ isSuccess })),
        this.updateDataSourceAfterChange,
      )
      .subscribe();
  }

  editTask(scheduledTask: ExecutiontTaskParameters): Observable<boolean> {
    if (this._multipleProjectList.isEntityBelongsToCurrentProject(scheduledTask)) {
      return this.editTaskInternal(scheduledTask.id!);
    }
    const url = ROOT_URL;
    const editParams = { [TASK_ID]: scheduledTask.id! };

    return this._multipleProjectList
      .confirmEntityEditInASeparateProject(scheduledTask, { url, search: editParams }, 'task')
      .pipe(
        switchMap((continueEdit) => {
          if (continueEdit) {
            return this.editTaskInternal(scheduledTask.id!);
          }
          return of(continueEdit);
        }),
      );
  }

  resolveEditLinkIfExists(): void {
    this._editorResolver
      .onEditEntity(TASK_ID)
      .pipe(
        take(1),
        switchMap((taskId) => this.editTaskInternal(taskId)),
      )
      .subscribe();
  }

  private editTaskInternal(id: string): Observable<boolean> {
    return this._schedulerService.getExecutionTaskById(id).pipe(
      switchMap((task) => this._scheduledTaskDialogs.editScheduledTask(task)),
      this.updateDataSourceAfterChange,
      map((result) => !!result),
    );
  }
}
