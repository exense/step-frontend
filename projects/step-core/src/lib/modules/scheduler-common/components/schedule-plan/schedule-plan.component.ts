import { Component, forwardRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SCHEDULER_COMMON_IMPORTS } from '../../types/scheduler-common-imports.constant';
import { DialogParentService, DialogRouteResult } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-schedule-plan',
  templateUrl: './schedule-plan.component.html',
  styleUrl: './schedule-plan.component.scss',
  imports: [SCHEDULER_COMMON_IMPORTS],
  providers: [
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => SchedulePlanComponent),
    },
  ],
})
export class SchedulePlanComponent implements DialogParentService {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  navigateBack(result?: DialogRouteResult): void {
    if (!result?.canNavigateBack) {
      return;
    }
    if (result.isSuccess) {
      this._router.navigateByUrl('/scheduler');
    } else {
      this._router.navigate(['..'], { relativeTo: this._activatedRoute });
    }
  }
}
