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
} from '@exense/step-core';
import { KeyValue } from '@angular/common';
import { Router } from '@angular/router';
import { map, of, pipe, switchMap, tap } from 'rxjs';

type StatusItem = KeyValue<string, string>;

@Component({
  selector: 'step-scheduled-task-list',
  templateUrl: './scheduled-task-list.component.html',
  styleUrls: ['./scheduled-task-list.component.scss'],
  providers: [
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

  readonly STATUS_ACTIVE_STRING = 'On';
  readonly STATUS_INACTIVE_STRING = 'Off';
  readonly STATUS: ReadonlyArray<string> = [this.STATUS_ACTIVE_STRING, this.STATUS_INACTIVE_STRING];

  readonly dataSource = this._schedulerService.createSelectionDataSource();
  readonly returnParentUrl = '/scheduler';

  isSchedulerEnabled: boolean = false;

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly settingsUrl =
    this._auth.hasRight('admin-ui-menu') && this._auth.isAuthenticated()
      ? '/admin/controller/scheduler'
      : '/settings/scheduler';

  readonly statusItems: StatusItem[] = [
    { key: true.toString(), value: this.STATUS_ACTIVE_STRING },
    { key: false.toString(), value: this.STATUS_INACTIVE_STRING },
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
