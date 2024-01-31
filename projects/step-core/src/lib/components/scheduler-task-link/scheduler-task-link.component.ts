import { Component, inject, Input } from '@angular/core';
import { ExecutiontTaskParameters } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { SchedulerActionsService } from '../../services/scheduler-actions.service';
import { LinkDisplayType } from '../../shared';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'step-scheduler-task-link',
  templateUrl: './scheduler-task-link.component.html',
  styleUrls: ['./scheduler-task-link.component.scss'],
})
export class SchedulerTaskLinkComponent implements CustomComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _logic = inject(SchedulerActionsService, { optional: true });

  @Input() context?: ExecutiontTaskParameters;

  readonly LinkDisplayType = LinkDisplayType;

  @Input() linkDisplayType: LinkDisplayType = LinkDisplayType.TEXT_ONLY;

  editParameter(): void {
    if (!this._logic || !this.context) {
      return;
    }
    // TODO temporary solution, while scheduler dialog supports two variants, how it can be opened
    if (this._activatedRoute.routeConfig?.path === 'scheduler') {
      this._logic.navigateToTaskEditor(this.context);
    } else {
      this._logic.editTask(this.context).subscribe();
    }
  }
}
