import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { ScheduledTaskLogicService } from '../services/scheduled-task-logic.service';

@Component({
  selector: 'step-scheduled-task-list',
  templateUrl: './scheduled-task-list.component.html',
  styleUrls: ['./scheduled-task-list.component.scss'],
  providers: [ScheduledTaskLogicService],
})

export class ScheduledTaskListComponent implements OnDestroy {
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
      name: (element, searchValue) => element.attributes!['name'].toLowerCase().includes(searchValue.toLowerCase()),
      environment: (element, searchValue) =>
        element.executionsParameters!.customParameters!['env'].toLowerCase().includes(searchValue.toLowerCase()),
      cronExpression: (element, searchValue) =>
        element.cronExpression!.toLowerCase().includes(searchValue.toLowerCase()),
      status: (element, searchValue) =>
        element.active
          ? this.STATUS_ACTIVE_STRING.toLowerCase().includes(searchValue.toLowerCase())
          : this.STATUS_INACTIVE_STRING.toLowerCase().includes(searchValue.toLowerCase()),
    },
    sortPredicates: {
      name: (elementA, elementB) => elementA.attributes!['name'].localeCompare(elementB.attributes!['name']),
      environment: (elementA, elementB) =>
        elementA.executionsParameters!.customParameters!['env'].localeCompare(
          elementB.executionsParameters!.customParameters!['env']
        ),
      status: (elementA, elementB) => +elementB.active! - +elementA.active!,
    },
  });
constructor() {}
  constructor(
    private _dashboardService: DashboardService,
    private _schedulerService: AugmentedSchedulerService,
    private _scheduledTaskDialogs: ScheduledTaskDialogsService,
    public readonly _logic: ScheduledTaskLogicService,
    public _location: Location
  ) {}

  private loadTable(): void {
    this.scheduledTaskRequest$.next({});
  }

  executeParameter(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService.executeTask(scheduledTask.id!).subscribe((executionId) => {
      this._location.go('#/root/executions/' + executionId);
    });
  }

  switchActive(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService
      .getExecutionTask(scheduledTask.id!)
      .pipe(
        switchMap((task) =>
          task.active
            ? this._schedulerService.removeExecutionTask(task.id!, false)
            : this._schedulerService.enableExecutionTask(task.id!)
        )
      )
      .subscribe(() => this.loadTable());
  }

  navToStats(scheduledTask: ExecutiontTaskParameters) {
    this._dashboardService
      .getDashboardLink(scheduledTask.id!)
      .pipe(first())
      .subscribe((url) => {
        window.open(url, '_blank');
      });
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
      .getExecutionTask(scheduledTask.id!)
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

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScheduledTaskList', downgradeComponent({ component: ScheduledTaskListComponent }));
