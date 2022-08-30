import { Component, Optional } from '@angular/core';
import { CustomComponent, ExecutiontTaskParameters } from '@exense/step-core';
import { ScheduledTaskLogicService } from '../../services/scheduled-task-logic.service';

@Component({
  selector: 'step-scheduler-task-link',
  templateUrl: './scheduler-task-link.component.html',
  styleUrls: ['./scheduler-task-link.component.scss'],
})
export class SchedulerTaskLinkComponent implements CustomComponent {
  context?: ExecutiontTaskParameters;

  constructor(@Optional() private _logic?: ScheduledTaskLogicService) {}

  editParameter(): void {
    if (!this._logic || !this.context) {
      return;
    }
    this._logic.editParameter(this.context);
  }

  navToPlan(): void {
    if (!this._logic || !this.context) {
      return;
    }
    this._logic.navToPlan(this.context!.executionsParameters!.repositoryObject!.repositoryParameters!['planid']!);
  }
}
