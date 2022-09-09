import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  BulkOperation,
  BulkOperationsInvokeService,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
} from '@exense/step-core';
import { ScheduledTaskLogicService } from '../services/scheduled-task-logic.service';
import { ScheduledTaskBulkOperationsInvokeService } from '../services/scheduled-task-bulk-operations-invoke.service';

@Component({
  selector: 'step-scheduled-task-list',
  templateUrl: './scheduled-task-list.component.html',
  styleUrls: ['./scheduled-task-list.component.scss'],
  providers: [
    ScheduledTaskLogicService,
    selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: ScheduledTaskBulkOperationsInvokeService,
    },
  ],
})
export class ScheduledTaskListComponent {
  readonly availableBulkOperations = [BulkOperation.delete, BulkOperation.duplicate];
  constructor(public readonly _logic: ScheduledTaskLogicService) {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScheduledTaskList', downgradeComponent({ component: ScheduledTaskListComponent }));
