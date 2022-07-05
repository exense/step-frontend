import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  DialogsService,
  IsUsedByDialogsService,
  AuthService,
  ContextService,
  Mutable,
  AugmentedSchedulerService,
  TableRestService,
  ExecutiontTaskParameters,
  TableLocalDataSource,
  TableAdapterService,
  TableAdapter,
} from '@exense/step-core';
import {
  Observable,
  BehaviorSubject,
  switchMap,
  of,
  catchError,
  noop,
  shareReplay,
  tap,
  map,
  lastValueFrom,
} from 'rxjs';
import { ScheduledTaskDialogsService } from '../services/scheduled-task-dialogs.service';
import { Location } from '@angular/common';
import { DashboardService } from '../../_common/services/dashboard.service';

@Component({
  selector: 'step-scheduled-task-list',
  templateUrl: './scheduled-task-list.component.html',
  styleUrls: ['./scheduled-task-list.component.scss'],
})
export class ScheduledTaskListComponent implements OnDestroy {
  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';

  readonly tableAdapter: TableAdapter = this._tableAdapterService.getTableAdapterForApiRequest(
    this._schedulerService.test()
  );
  private request$: Observable<Array<ExecutiontTaskParameters>> = this.tableAdapter.request!;
  private subject$ = this.tableAdapter.subject;
  readonly searchableScheduledTask$ = new TableLocalDataSource(this.request$, {
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

  constructor(
    private _tableAdapterService: TableAdapterService,
    private _dashboardService: DashboardService,
    private _schedulerService: AugmentedSchedulerService,
    private _scheduledTaskDialogs: ScheduledTaskDialogsService,
    public _location: Location
  ) {}

  private loadTable(): void {
    this.subject$!.next({});
  }

  executeParameter(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService.execute1(scheduledTask.id!).subscribe((executionId) => {
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
    window.open(this._dashboardService.getDashboardLink(scheduledTask.id!), '_blank');
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
    this.subject$!.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScheduledTaskList', downgradeComponent({ component: ScheduledTaskListComponent }));
