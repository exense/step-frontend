import { inject, Injectable } from '@angular/core';
import {
  AugmentedSchedulerService,
  AuthService,
  DashboardService,
  EditorResolverService,
  ExecutiontTaskParameters,
  MultipleProjectsService,
  ScheduledTaskDialogsService,
} from '@exense/step-core';
import { first, Observable, pipe, switchMap, take, tap } from 'rxjs';
import { Location } from '@angular/common';

const TASK_ID = 'taskId';

@Injectable()
export class ScheduledTaskLogicService {
  private _authService = inject(AuthService);
  private _dashboardService = inject(DashboardService);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _scheduledTaskDialogs = inject(ScheduledTaskDialogsService);
  private _location = inject(Location);
  private _multipleProjectList = inject(MultipleProjectsService);
  private _editorResolver = inject(EditorResolverService);

  private updateDataSourceAfterChange = pipe(
    tap((result?: ExecutiontTaskParameters | boolean) => {
      if (result) {
        this.dataSource.reload();
      }
    })
  );

  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';
  readonly STATUS: ReadonlyArray<string> = [this.STATUS_ACTIVE_STRING, this.STATUS_INACTIVE_STRING];

  readonly dataSource = this._schedulerService.createSelectionDataSource();

  isSchedulerEnabled(): Observable<boolean> {
    return this._schedulerService.isSchedulerEnabled();
  }

  executeParameter(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService.executeTask(scheduledTask.id!).subscribe((executionId) => {
      this._location.go('#/root/executions/' + executionId);
    });
  }

  switchActive(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService
      .getExecutionTaskById(scheduledTask.id!)
      .pipe(
        switchMap((task) =>
          task.active
            ? this._schedulerService.enableExecutionTask(task.id!, false)
            : this._schedulerService.enableExecutionTask(task.id!, true)
        ),
        this.updateDataSourceAfterChange
      )
      .subscribe();
  }

  navToStats(scheduledTask: ExecutiontTaskParameters) {
    const url = this._dashboardService.getDashboardLink(scheduledTask.id!);
    window.open(url, '_blank');
  }

  navToPlan(planId: string) {
    this._location.go('#/root/plans/editor/' + planId);
  }

  navToSettings() {
    if (this._authService.hasRight('admin-ui-menu') && this._authService.isAuthenticated()) {
      this._location.go('#/root/admin/controller/scheduler');
    } else {
      this._location.go('#/root/settings/scheduler');
    }
  }

  deleteParameter(scheduledTask: ExecutiontTaskParameters): void {
    this._scheduledTaskDialogs.removeScheduledTask(scheduledTask).pipe(this.updateDataSourceAfterChange).subscribe();
  }

  editParameter(scheduledTask: ExecutiontTaskParameters): void {
    if (this._multipleProjectList.isEntityBelongsToCurrentProject(scheduledTask)) {
      this.editParameterInternal(scheduledTask.id!);
      return;
    }
    const url = '/root/scheduler';
    const editParams = { [TASK_ID]: scheduledTask.id! };

    this._multipleProjectList
      .confirmEntityEditInASeparateProject(scheduledTask, { url, search: editParams }, 'task')
      .subscribe((continueEdit) => {
        if (continueEdit) {
          this.editParameterInternal(scheduledTask.id!);
        }
      });
  }

  createParameter() {
    this._schedulerService
      .createExecutionTask()
      .pipe(
        switchMap((task) => this._scheduledTaskDialogs.editScheduledTask(task)),
        this.updateDataSourceAfterChange
      )
      .subscribe();
  }

  resolveEditLinkIfExists(): void {
    this._editorResolver
      .onEditEntity(TASK_ID)
      .pipe(take(1))
      .subscribe((taskId) => this.editParameterInternal(taskId));
  }

  private editParameterInternal(id: string): void {
    this._schedulerService
      .getExecutionTaskById(id)
      .pipe(
        switchMap((task) => this._scheduledTaskDialogs.editScheduledTask(task)),
        this.updateDataSourceAfterChange
      )
      .subscribe();
  }
}
