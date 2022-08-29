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
export class ScheduledTaskListComponent {
  constructor(public readonly _logic: ScheduledTaskLogicService) {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScheduledTaskList', downgradeComponent({ component: ScheduledTaskListComponent }));
