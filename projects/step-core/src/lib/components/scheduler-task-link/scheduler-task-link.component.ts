import { Component, inject, Input } from '@angular/core';
import { ExecutiontTaskParameters } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { SchedulerActionsService } from '../../services/scheduler-actions.service';
import { LinkDisplayType } from '../../shared';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonEditorUrlsService } from '../../modules/basics/step-basics.module';

@Component({
  selector: 'step-scheduler-task-link',
  templateUrl: './scheduler-task-link.component.html',
  styleUrls: ['./scheduler-task-link.component.scss'],
})
export class SchedulerTaskLinkComponent implements CustomComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _logic = inject(SchedulerActionsService, { optional: true });
  private _commonEditorsUrl = inject(CommonEditorUrlsService);
  private _router = inject(Router);

  @Input() context?: ExecutiontTaskParameters;

  readonly LinkDisplayType = LinkDisplayType;

  @Input() linkDisplayType: LinkDisplayType = LinkDisplayType.TEXT_ONLY;

  editParameter(): void {
    if (!this._logic || !this.context) {
      return;
    }
    // TODO temporary solution - scheduler dialog only uses new route based dialog when directly opend on the schedule page
    if (this._activatedRoute.routeConfig?.path === 'scheduler') {
      this._router.navigateByUrl(this._commonEditorsUrl.schedulerTaskEditorUrl(this.context));
    } else {
      this._logic.editTask(this.context).subscribe();
    }
  }
}
