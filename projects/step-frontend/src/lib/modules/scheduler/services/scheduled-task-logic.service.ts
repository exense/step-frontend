import { Injectable } from '@angular/core';
import {
  AugmentedSchedulerService,
  DashboardService,
  ExecutiontTaskParameters,
  TableFetchLocalDataSource,
} from '@exense/step-core';
import { Observable, switchMap } from 'rxjs';
import { ScheduledTaskDialogsService } from '@exense/step-core';
import { Location } from '@angular/common';

@Injectable()
export class ScheduledTaskLogicService {
  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';

  readonly searchableScheduledTask = new TableFetchLocalDataSource(
    () => this._schedulerService.getScheduledExecutions(),
    TableFetchLocalDataSource.configBuilder<ExecutiontTaskParameters>()
      .addSearchStringPredicate('cronExpression', (item) => item.cronExpression!)
      .addSearchStringPredicate('status', (item) =>
        item.active ? this.STATUS_ACTIVE_STRING : this.STATUS_INACTIVE_STRING
      )
      .addSortBooleanPredicate('status', (item) => item.active)
      .build()
  );

  constructor(
    private _dashboardService: DashboardService,
    private _schedulerService: AugmentedSchedulerService,
    private _scheduledTaskDialogs: ScheduledTaskDialogsService,
    public _location: Location
  ) {}

  loadTable(): void {
    this.searchableScheduledTask.reload();
  }

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
        )
      )
      .subscribe(() => this.loadTable());
  }

  navToStats(scheduledTask: ExecutiontTaskParameters) {
    const url = this._dashboardService.getDashboardLink(scheduledTask.id!);
    window.open(url, '_blank');
  }

  navToPlan(planId: string) {
    this._location.go('#/root/plans/editor/' + planId);
  }

  navToSettings() {
    this._location.go('#/root/admin/controller/scheduler');
  }

  deletePrameter(scheduledTask: ExecutiontTaskParameters): void {
    this._scheduledTaskDialogs.removeScheduledTask(scheduledTask).subscribe(() => this.loadTable());
  }

  editParameter(scheduledTask: ExecutiontTaskParameters): void {
    this._schedulerService
      .getExecutionTaskById(scheduledTask.id!)
      .pipe(switchMap((task) => this._scheduledTaskDialogs.editScheduledTask(task)))
      .subscribe((_) => this.loadTable());
  }

  createParameter() {
    this._schedulerService
      .createExecutionTask()
      .pipe(switchMap((task) => this._scheduledTaskDialogs.editScheduledTask(task)))
      .subscribe((_) => this.loadTable());
  }
}
