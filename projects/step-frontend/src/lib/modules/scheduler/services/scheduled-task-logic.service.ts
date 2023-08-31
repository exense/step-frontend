import { inject, Injectable } from '@angular/core';
import {
  AJS_LOCATION,
  AugmentedPlansService,
  AugmentedSchedulerService,
  AuthService,
  DashboardService,
  EditorResolverService,
  ExecutiontTaskParameters,
  MultipleProjectsService,
  PlanLinkDialogService,
  ScheduledTaskDialogsService,
  SchedulerActionsService,
} from '@exense/step-core';
import { map, Observable, of, pipe, switchMap, take, tap } from 'rxjs';
import { Location } from '@angular/common';

const TASK_ID = 'taskId';

@Injectable()
export class ScheduledTaskLogicService implements SchedulerActionsService {
  private _plansApi = inject(AugmentedPlansService);
  private _plansLink = inject(PlanLinkDialogService);
  private _authService = inject(AuthService);
  private _dashboardService = inject(DashboardService);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _scheduledTaskDialogs = inject(ScheduledTaskDialogsService);
  private _location = inject(Location);
  private _$location = inject(AJS_LOCATION);
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

  navToPlan(planId: string): void {
    this._plansApi
      .getPlanById(planId)
      .pipe(switchMap((plan) => this._plansLink.editPlan(plan)))
      .subscribe();
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

  editParameter(scheduledTask: ExecutiontTaskParameters): Observable<boolean> {
    if (this._multipleProjectList.isEntityBelongsToCurrentProject(scheduledTask)) {
      return this.editParameterInternal(scheduledTask.id!);
    }
    const url = this._$location.path();
    const editParams = { [TASK_ID]: scheduledTask.id! };

    return this._multipleProjectList
      .confirmEntityEditInASeparateProject(scheduledTask, { url, search: editParams }, 'task')
      .pipe(
        switchMap((continueEdit) => {
          if (continueEdit) {
            return this.editParameterInternal(scheduledTask.id!);
          }
          return of(continueEdit);
        })
      );
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

  private editParameterInternal(id: string): Observable<boolean> {
    return this._schedulerService.getExecutionTaskById(id).pipe(
      switchMap((task) => this._scheduledTaskDialogs.editScheduledTask(task)),
      this.updateDataSourceAfterChange,
      map((result) => !!result)
    );
  }
}
