import { Component, inject } from '@angular/core';
import { PurePlanEditApiService } from '../../injectables/pure-plan-edit-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import {
  ExecutiontTaskParameters,
  Plan,
  PlanEditorApiService,
  ScheduledTaskTemporaryStorageService,
} from '@exense/step-core';

@Component({
  selector: 'step-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.scss'],
  providers: [
    {
      provide: PlanEditorApiService,
      useClass: PurePlanEditApiService,
    },
  ],
})
export class PlanEditorComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _router = inject(Router);

  readonly plan$ = this._activatedRoute.data.pipe(map((data) => data['plan'] as Plan | undefined));

  handleTaskSchedule(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate(['.', 'schedule', temporaryId], { relativeTo: this._activatedRoute });
  }
}
