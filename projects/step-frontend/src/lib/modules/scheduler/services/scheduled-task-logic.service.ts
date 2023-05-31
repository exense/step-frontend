import { Injectable, OnDestroy } from '@angular/core';
import {
  AugmentedSchedulerService,
  AuthService,
  DashboardService,
  ExecutiontTaskParameters,
  Mutable,
  TableLocalDataSource,
} from '@exense/step-core';
import { BehaviorSubject, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { ScheduledTaskDialogsService } from '@exense/step-core';
import { Location } from '@angular/common';

type InProgress = Mutable<Pick<ScheduledTaskLogicService, 'inProgress'>>;

@Injectable()
export class ScheduledTaskLogicService implements OnDestroy {
  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';

  readonly inProgress: boolean = false;

  private scheduledTaskRequest$ = new BehaviorSubject<any>({});
  private scheduledTask$ = this.scheduledTaskRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._schedulerService.getScheduledExecutions()),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableScheduledTask$ = new TableLocalDataSource(this.scheduledTask$, {
    searchPredicates: {
      cronExpression: (element, searchValue) =>
        element.cronExpression!.toLowerCase().includes(searchValue.toLowerCase()),
      status: (element, searchValue) =>
        element.active
          ? this.STATUS_ACTIVE_STRING.toLowerCase().includes(searchValue.toLowerCase())
          : this.STATUS_INACTIVE_STRING.toLowerCase().includes(searchValue.toLowerCase()),
    },
    sortPredicates: {
      status: (elementA, elementB) => +elementB.active! - +elementA.active!,
    },
  });

  constructor(
    private _dashboardService: DashboardService,
    private _schedulerService: AugmentedSchedulerService,
    private _scheduledTaskDialogs: ScheduledTaskDialogsService,
    public _location: Location,
    private _authService: AuthService
  ) {}

  loadTable(): void {
    this.scheduledTaskRequest$.next({});
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
    if (this._authService.hasRight('admin-ui-menu') && this._authService.isAuthenticated()) {
      this._location.go('#/root/admin/controller/scheduler');
    } else {
      this._location.go('#/root/settings/scheduler');
    }
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

  ngOnDestroy(): void {
    this.scheduledTaskRequest$.complete();
  }
}
