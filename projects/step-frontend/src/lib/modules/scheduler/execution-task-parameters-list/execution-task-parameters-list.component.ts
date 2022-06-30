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
  SchedulerService,
  TableRestService,
  ExecutiontTaskParameters,
  TableLocalDataSource,
} from '@exense/step-core';
import { BehaviorSubject, switchMap, of, catchError, noop, shareReplay, tap, map, lastValueFrom } from 'rxjs';
import { ExecutionTaskParameterDialogsService } from '../services/execution-task-parameter-dialogs.service';
import { Location } from '@angular/common';
import { DashboardService } from '../../_common/services/dashboard.service';

type InProgress = Mutable<Pick<ExecutionTaskParametersListComponent, 'inProgress'>>;

@Component({
  selector: 'step-execution-task-parameters-list',
  templateUrl: './execution-task-parameters-list.component.html',
  styleUrls: ['./execution-task-parameters-list.component.scss'],
})
export class ExecutionTaskParametersListComponent {
  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';

  readonly currentUserName: string;
  readonly inProgress: boolean = false;

  private executionTaskParametersRequest$ = new BehaviorSubject<any>({});
  private executionTaskParameters$ = this.executionTaskParametersRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._schedulerService.getScheduledExecutions()),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableExecutionTaskParameters$ = new TableLocalDataSource(this.executionTaskParameters$, {
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
    private _dashboardService: DashboardService,
    private _schedulerService: SchedulerService,
    private _dialogs: DialogsService,
    private _executionTaskParameterDialogs: ExecutionTaskParameterDialogsService,
    private _isUsedByDialogs: IsUsedByDialogsService,
    private _auth: AuthService,
    private _tableRest: TableRestService,
    public _location: Location,
    private _httpClient: HttpClient,
    context: ContextService
  ) {
    this.currentUserName = context.userName;
  }

  private loadTable(): void {
    this.executionTaskParametersRequest$.next({});
  }

  executeParameter(executionTaskParameters: ExecutiontTaskParameters) {
    //@ts-ignore
    // prettier-ignore
    this._httpClient.post<any>('rest/scheduler/task/' + executionTaskParameters.id + '/execute', null, { responseType: 'text' }).subscribe((executionId) => { this._location.go('#/root/executions/' + executionId) });
  }

  switchActive(executionTaskParameters: ExecutiontTaskParameters) {
    this._schedulerService
      .getExecutionTask(executionTaskParameters.id!)
      .pipe(
        switchMap((task) =>
          task.active
            ? this._schedulerService.removeExecutionTask(task.id!, false)
            : this._schedulerService.enableExecutionTask(task.id!)
        )
      )
      .subscribe(() => this.loadTable());
  }

  navToStats(executionTaskParameters: ExecutiontTaskParameters) {
    window.open(this._dashboardService.getDashboardLink(executionTaskParameters.id), '_blank');
  }

  navToPlan(planId: string) {
    this._location.go('#/root/plans/editor/' + planId);
  }

  navToSettings() {
    this._location.go('#/root/admin/controller/scheduler');
  }

  deletePrameter(executionTaskParameters: ExecutiontTaskParameters): void {
    this._executionTaskParameterDialogs
      .removeExecutionTaskParameter(executionTaskParameters)
      .subscribe(() => this.loadTable());
  }

  editParameter(executionTaskParameters: ExecutiontTaskParameters): void {
    this._schedulerService
      .getExecutionTask(executionTaskParameters.id!)
      .pipe(switchMap((task) => this._executionTaskParameterDialogs.editExecutionTaskParameter(task)))
      .subscribe((_) => this.loadTable());
  }

  createParameter() {
    this._schedulerService
      .createExecutionTask()
      .pipe(switchMap((task) => this._executionTaskParameterDialogs.editExecutionTaskParameter(task)))
      .subscribe((_) => this.loadTable());
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(
    'stepExecutionTaskParametersList',
    downgradeComponent({ component: ExecutionTaskParametersListComponent })
  );
