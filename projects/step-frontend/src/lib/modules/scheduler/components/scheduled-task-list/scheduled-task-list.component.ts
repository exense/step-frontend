import { AfterViewInit, Component, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  BulkOperationType,
  BulkOperationsInvokeService,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
  ArrayItemLabelValueExtractor,
  FilterConditionFactoryService,
  AJS_LOCATION,
} from '@exense/step-core';
import { ScheduledTaskLogicService } from '../../services/scheduled-task-logic.service';
import { ScheduledTaskBulkOperationsInvokeService } from '../../services/scheduled-task-bulk-operations-invoke.service';
import { KeyValue } from '@angular/common';

type StatusItem = KeyValue<string, string>;

@Component({
  selector: 'step-scheduled-task-list',
  templateUrl: './scheduled-task-list.component.html',
  styleUrls: ['./scheduled-task-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('scheduledTaskList', STORE_ALL),
    ScheduledTaskLogicService,
    selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: ScheduledTaskBulkOperationsInvokeService,
    },
  ],
})
export class ScheduledTaskListComponent implements AfterViewInit {
  private _location = inject(AJS_LOCATION);
  public readonly _logic = inject(ScheduledTaskLogicService);

  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'task-delete' },
    { operation: BulkOperationType.duplicate, permission: 'task-write' },
  ];
  isSchedulerEnabled: boolean = false;

  readonly _filterConditionFactory = inject(FilterConditionFactoryService);

  readonly statusItems: StatusItem[] = [
    { key: true.toString(), value: this._logic.STATUS_ACTIVE_STRING },
    { key: false.toString(), value: this._logic.STATUS_INACTIVE_STRING },
  ];

  readonly extractor: ArrayItemLabelValueExtractor<StatusItem> = {
    getValue: (item) => item.key,
    getLabel: (item) => item.value,
  };

  ngOnInit(): void {
    this._logic.isSchedulerEnabled().subscribe((data) => {
      this.isSchedulerEnabled = data;
    });
  }

  ngAfterViewInit(): void {
    const { createNew } = this._location.search();
    if (createNew !== undefined) {
      this._location.search('createNew', null);
      // Timeout to be sure, that navigation events has been completed
      // Otherwise location change might auto close the modal
      setTimeout(() => this._logic.createParameter(), 500);
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScheduledTaskList', downgradeComponent({ component: ScheduledTaskListComponent }));
