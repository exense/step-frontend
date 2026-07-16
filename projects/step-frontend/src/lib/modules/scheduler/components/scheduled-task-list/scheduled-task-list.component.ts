import { ChangeDetectorRef, Component, forwardRef, inject } from '@angular/core';
import {
  ExecutiontTaskParameters,
  tablePersistenceConfigProvider,
  STORE_ALL,
  ArrayItemLabelValueExtractor,
  FilterConditionFactoryService,
  DialogParentService,
  AuthService,
  AugmentedSchedulerService,
  CommonEntitiesUrlsService,
  DialogRouteResult,
  DialogsService,
  tableColumnsConfigProvider,
  AlertType,
  entitySelectionStateProvider,
  DateFormat,
  StepDataSource,
} from '@exense/step-core';
import { KeyValue } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

type StatusItem = KeyValue<string, string>;
type ScheduledTask = ExecutiontTaskParameters & {
  nextExecutionTimestamp?: number;
};

enum ActiveLabels {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Component({
  selector: 'step-scheduled-task-list',
  templateUrl: './scheduled-task-list.component.html',
  styleUrls: ['./scheduled-task-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedSchedulerService.TASKS_TABLE_ID,
      entityScreenId: 'executionParameters',
      entityScreenSubPath: 'executionsParameters.customParameters',
    }),
    tablePersistenceConfigProvider('scheduledTaskList', STORE_ALL),
    ...entitySelectionStateProvider<string, ExecutiontTaskParameters>('id'),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ScheduledTaskListComponent),
    },
  ],
  standalone: false,
})
export class ScheduledTaskListComponent implements DialogParentService {
  private _auth = inject(AuthService);
  private _dialogs = inject(DialogsService);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _router = inject(Router);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  private updateDataSourceAfterChange = pipe(
    tap((result?: DialogRouteResult) => {
      if (result?.isSuccess) {
        this.dataSource.reload();
      }
    }),
  );

  readonly ActiveLabels = ActiveLabels;
  readonly DateFormat = DateFormat;

  readonly dataSource = this._schedulerService.createDataSource() as StepDataSource<ScheduledTask>;
  readonly returnParentUrl = '/scheduler';

  protected readonly isSchedulerDisabled = toSignal(
    this._schedulerService.isSchedulerEnabled().pipe(
      map((result) => !result),
      catchError(() => of(false)),
    ),
    { initialValue: false },
  );

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly settingsUrl = '/admin/controller/scheduler';

  readonly statusItems: StatusItem[] = [
    { key: true.toString(), value: this.ActiveLabels.ACTIVE },
    { key: false.toString(), value: this.ActiveLabels.INACTIVE },
  ];

  readonly extractor: ArrayItemLabelValueExtractor<StatusItem> = {
    getValue: (item) => item.key,
    getLabel: (item) => item.value,
  };

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  executeTask(scheduledTask: ExecutiontTaskParameters): void {
    this._schedulerService.executeTask(scheduledTask.id!).subscribe((executionId) => {
      this._router.navigateByUrl(this._commonEntitiesUrls.executionUrl(executionId));
    });
  }

  switchActive(scheduledTask: ScheduledTask): void {
    this._schedulerService
      .getExecutionTaskById(scheduledTask.id!)
      .pipe(
        tap((task) => {
          // Switch task status in the GUI immediately while the row timestamp is refreshed.
          scheduledTask.active = !task.active;
          return task;
        }),
        switchMap((task) => {
          const isActive = !task.active;
          return this._schedulerService.enableExecutionTask(task.id!, isActive).pipe(map(() => isActive));
        }),
        switchMap((isActive) =>
          isActive
            ? this._schedulerService.getNextExecutionDate(scheduledTask.id!).pipe(catchError(() => of(undefined)))
            : of(undefined),
        ),
        tap((nextExecutionTimestamp) => {
          this.updateNextExecutionTimestamp(scheduledTask, nextExecutionTimestamp);
        }),
      )
      .subscribe();
  }

  private updateNextExecutionTimestamp(scheduledTask: ScheduledTask, nextExecutionTimestamp?: number): void {
    if (nextExecutionTimestamp === undefined) {
      delete scheduledTask.nextExecutionTimestamp;
      this._changeDetectorRef.markForCheck();
      return;
    }

    scheduledTask.nextExecutionTimestamp = nextExecutionTimestamp;
    this._changeDetectorRef.markForCheck();
  }

  deleteTask(scheduledTask: ExecutiontTaskParameters): void {
    const paramName: string = scheduledTask.attributes!['name']!;

    this._dialogs
      .showDeleteWarning(1, `Task "${paramName}"`)
      .pipe(
        switchMap((isDeleteConfimred) =>
          isDeleteConfimred
            ? this._schedulerService.deleteExecutionTask(scheduledTask.id!).pipe(map(() => true))
            : of(false),
        ),
        map((isSuccess) => ({ isSuccess })),
        this.updateDataSourceAfterChange,
      )
      .subscribe();
  }

  protected readonly AlertType = AlertType;
}
