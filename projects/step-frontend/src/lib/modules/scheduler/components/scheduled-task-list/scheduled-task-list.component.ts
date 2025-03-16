import { Component, forwardRef, inject, OnInit } from '@angular/core';
import {
  AutoDeselectStrategy,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
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
} from '@exense/step-core';
import { KeyValue } from '@angular/common';
import { Router } from '@angular/router';
import { map, of, pipe, switchMap, tap } from 'rxjs';

type StatusItem = KeyValue<string, string>;

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
      allowDefaultVisibilityConfiguration: true,
    }),
    tablePersistenceConfigProvider('scheduledTaskList', STORE_ALL),
    ...selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ScheduledTaskListComponent),
    },
  ],
})
export class ScheduledTaskListComponent implements OnInit, DialogParentService {
  private _auth = inject(AuthService);
  private _dialogs = inject(DialogsService);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _router = inject(Router);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  private updateDataSourceAfterChange = pipe(
    tap((result?: DialogRouteResult) => {
      if (result?.isSuccess) {
        this.dataSource.reload();
      }
    }),
  );

  readonly ActiveLabels = ActiveLabels;

  readonly dataSource = this._schedulerService.createSelectionDataSource();
  readonly returnParentUrl = '/scheduler';

  isSchedulerEnabled: boolean = false;

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

  ngOnInit(): void {
    this._schedulerService.isSchedulerEnabled().subscribe((data) => {
      this.isSchedulerEnabled = data;
    });
  }

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  executeTask(scheduledTask: ExecutiontTaskParameters) {
    this._schedulerService.executeTask(scheduledTask.id!).subscribe((executionId) => {
      this._router.navigateByUrl(this._commonEntitiesUrls.executionUrl(executionId));
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
}
