import { Component, inject, Input } from '@angular/core';
import { ExecutiontTaskParameters } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { SchedulerActionsService } from '../../services/scheduler-actions.service';
import { LinkDisplayType } from '../../shared';

@Component({
  selector: 'step-scheduler-task-link',
  templateUrl: './scheduler-task-link.component.html',
  styleUrls: ['./scheduler-task-link.component.scss'],
})
export class SchedulerTaskLinkComponent implements CustomComponent {
  private _logic = inject(SchedulerActionsService, { optional: true });

  @Input() context?: ExecutiontTaskParameters;

  readonly LinkDisplayType = LinkDisplayType;

  @Input() linkDisplayType: LinkDisplayType = LinkDisplayType.TEXT_ONLY;

  editParameter(): void {
    if (!this._logic || !this.context) {
      return;
    }
    this._logic.editTask(this.context).subscribe();
  }
}
