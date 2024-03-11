import { Component, inject, Input } from '@angular/core';
import { ExecutiontTaskParameters } from '../../../../client/step-client-module';
import { SCHEDULER_COMMON_IMPORTS } from '../../types/scheduler-common-imports.consant';
import { SchedulerActionsService } from '../../injectables/scheduler-actions.service';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { LinkDisplayType, CommonEntitiesUrlsService } from '../../../basics/step-basics.module';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-scheduler-task-link',
  templateUrl: './scheduler-task-link.component.html',
  styleUrls: ['./scheduler-task-link.component.scss'],
  standalone: true,
  imports: [SCHEDULER_COMMON_IMPORTS],
})
export class SchedulerTaskLinkComponent implements CustomComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _logic = inject(SchedulerActionsService, { optional: true });
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
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
      this._router.navigateByUrl(this._commonEntitiesUrls.schedulerTaskEditorUrl(this.context));
    } else {
      this._logic.editTask(this.context).subscribe();
    }
  }
}
