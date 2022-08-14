import { Component, Inject, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { BehaviorSubject, switchMap, shareReplay, tap, first } from 'rxjs';
import {
  AJS_LOCATION,
  AJS_MODULE,
  AugmentedSchedulerService,
  DashboardService,
  ExportService,
  ExecutiontTaskParameters,
  Mutable,
  SchedulerService,
  TableLocalDataSource,
} from '@exense/step-core';
import { MonitoringService } from '../monitoring.service';
import { DashboardEntry } from '../model/dashboard-entry';
import { DateFormat } from '../../_common/shared/date-format.enum';
import { ILocationService } from 'angular';
import { ScheduledTaskDialogsService } from '../../scheduler/services/scheduled-task-dialogs.service';
import { DateTime } from 'luxon';

type InProgress = Mutable<Pick<MonitoringListComponent, 'inProgress'>>;

@Component({
  selector: 'step-monitoring-list',
  templateUrl: './monitoring-list.component.html',
  styleUrls: ['./monitoring-list.component.scss'],
})
export class MonitoringListComponent implements OnDestroy {
  now = new Date();
  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';

  readonly DateFormat = DateFormat;

  readonly inProgress: boolean = false;

  private fetchDataSubject$ = new BehaviorSubject<any>({});
  private dashboardEntries$ = this.fetchDataSubject$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this.monitoringService.getDashboardEntries()),
    tap((list) =>
      list.forEach(
        (item) =>
          (item['relativeExecutionTime'] = item.lastExecution
            ? DateTime.fromMillis(item.lastExecution.startTime!).toRelative()
            : undefined)
      )
    ),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly dataSource = new TableLocalDataSource<DashboardEntry>(this.dashboardEntries$, {
    searchPredicates: {
      name: (element, searchValue) =>
        !!element.schedulerTask.attributes?.['name']?.toLowerCase().includes(searchValue.toLowerCase()),
      environment: (element, searchValue) =>
        this.getEnvironment(element).toLowerCase().includes(searchValue.toLowerCase()),
      cronExpression: (element, searchValue) =>
        element.schedulerTask.cronExpression!.toLowerCase().includes(searchValue.toLowerCase()),
      status: (element, searchValue) =>
        element.simplifiedStatus.toLocaleLowerCase().includes(searchValue.toLowerCase()),
    },
    sortPredicates: {
      name: (elementA, elementB) => this.getName(elementA)?.localeCompare(this.getName(elementB)),
      environment: (a, b) => this.getEnvironment(a)?.localeCompare(this.getEnvironment(b)),
      cronExpression: (a, b) => 1 || a.schedulerTask?.cronExpression?.localeCompare(b.schedulerTask?.cronExpression!),
      status: (a, b) => a.simplifiedStatus?.localeCompare(b.simplifiedStatus),
      lastExecution: (a, b) => a.lastExecution?.startTime! - b.lastExecution?.startTime!,
      lastStatusChange: (a, b) =>
        a.lastExecutionBeforeResultChange?.startTime! - b.lastExecutionBeforeResultChange?.startTime!,
    },
  });

  getName(entry: DashboardEntry): string {
    return entry.schedulerTask?.attributes?.['name']!;
  }

  getEnvironment(entry: DashboardEntry): string {
    return entry.schedulerTask.executionsParameters!.customParameters!['env']!;
  }

  constructor(
    private monitoringService: MonitoringService,
    private _dashboardService: DashboardService,
    @Inject(AJS_LOCATION) private _location: ILocationService,
    private _scheduledTaskDialogs: ScheduledTaskDialogsService,
    private augmentedSchedulerService: AugmentedSchedulerService,
    private exportService: ExportService,
    private schedulerService: SchedulerService
  ) {}

  navigateToPlanEditor(entry: DashboardEntry): void {
    this._location.path(
      `/root/plans/editor/${entry.schedulerTask?.executionsParameters?.repositoryObject?.repositoryParameters?.['planid']}`
    );
  }

  navigateToExecution(entry: DashboardEntry): void {
    this._location.path(`/root/executions/${entry.lastExecution?.id}`);
  }

  navigateToMonitoringSettings(): void {
    this._location.path('/root/monitoringConfiguration');
  }

  exportAsCSV() {
    this.exportService.get('rest/monitoringdashboard/export');
  }

  editTask(taskId: string): void {
    this.schedulerService
      .getExecutionTask(taskId)
      .pipe(switchMap((task) => this._scheduledTaskDialogs.editScheduledTask(task)))
      .subscribe((_) => this.fetchTableData());
  }

  navToStats(scheduledTask: ExecutiontTaskParameters): void {
    this._dashboardService
      .getDashboardLink(scheduledTask.id!)
      .pipe(first())
      .subscribe((url) => {
        window.open(url, '_blank');
      });
  }

  executeTask(schedulerTask: ExecutiontTaskParameters): void {
    if (!schedulerTask.id) {
      return;
    }
    this.schedulerService.execute1(schedulerTask.id).subscribe((executionId) => {
      this._location.path('#/root/executions/' + executionId);
    });
  }

  private fetchTableData(): void {
    this.fetchDataSubject$.next({});
  }

  ngOnDestroy(): void {
    this.fetchDataSubject$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepMonitoringList', downgradeComponent({ component: MonitoringListComponent }));
