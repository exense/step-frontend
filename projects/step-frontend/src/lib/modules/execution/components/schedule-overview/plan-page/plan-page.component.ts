import { Component, DestroyRef, effect, inject, OnInit, Signal, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanPageStateService } from './plan-page-state.service';
import { DashboardUrlParamsService } from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { SCHEDULE_ID } from '../../../services/schedule-id.token';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { VIEW_MODE, ViewMode } from '../../../shared/view-mode';
import { AugmentedPlansService, AugmentedSchedulerService, PlansService } from '@exense/step-core';
import { PLAN_ID } from '../../../services/plan-id.token';

declare const uPlot: any;

interface EntityWithKeywordsStats {
  entity: string;
  timestamp: number;
  statuses: Record<string, number>;
}

@Component({
  selector: 'step-scheduler-page',
  templateUrl: './plan-page.component.html',
  styleUrls: ['./plan-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    DashboardUrlParamsService,
    {
      provide: PLAN_ID,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return () => _activatedRoute.snapshot.params?.['id'] ?? '';
      },
    },
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
    {
      provide: CrossExecutionDashboardState,
      useClass: PlanPageStateService,
    },
  ],
})
export class PlanPageComponent implements OnInit {
  _state = inject(CrossExecutionDashboardState);
  readonly _planIdFn = inject(PLAN_ID);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _planService = inject(AugmentedPlansService);

  ngOnInit(): void {
    this._planService.getPlanById(this._planIdFn()).subscribe((plan) => this._state.plan.set(plan));
  }
}
