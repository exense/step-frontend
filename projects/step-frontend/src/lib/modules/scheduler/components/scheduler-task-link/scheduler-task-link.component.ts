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
  protected descriptionToggledActive = false;
  constructor(@Optional() private _logic?: ScheduledTaskLogicService) {}

  editParameter(): void {
    if (!this._logic || !this.context) {
      return;
    }
    this._logic.editParameter(this.context);
  }

  setActiveState(isToggledActive: boolean) {
    this.descriptionToggledActive = isToggledActive;
  }
}
