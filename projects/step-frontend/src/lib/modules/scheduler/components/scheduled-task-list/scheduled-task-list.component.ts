import { Component } from '@angular/core';
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
} from '@exense/step-core';
import { ScheduledTaskLogicService } from '../../services/scheduled-task-logic.service';
import { ScheduledTaskBulkOperationsInvokeService } from '../../services/scheduled-task-bulk-operations-invoke.service';

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
export class ScheduledTaskListComponent {
  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'task-delete' },
    { operation: BulkOperationType.duplicate, permission: 'task-write' },
  ];
  isSchedulerEnabled: boolean = false;
  constructor(public readonly _logic: ScheduledTaskLogicService) {}

  ngOnInit(): void {
    this._logic.isSchedulerEnabled().subscribe((data) => {
      this.isSchedulerEnabled = data;
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScheduledTaskList', downgradeComponent({ component: ScheduledTaskListComponent }));
