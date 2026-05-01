import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardUrlParamsService } from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { VIEW_MODE, ViewMode } from '../../../shared/view-mode';
import { AugmentedPlansService, AugmentedSchedulerService, ExecutionsService, PlansService } from '@exense/step-core';
import { RepositoryPageStateService } from './repository-page-state.service';
import { EXECUTION_ID } from '../../../services/execution-id.token';

@Component({
  selector: 'step-scheduler-page',
  templateUrl: './repository-page.component.html',
  styleUrls: ['./repository-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    DashboardUrlParamsService,
    {
      provide: EXECUTION_ID,
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
      useClass: RepositoryPageStateService,
    },
  ],
  standalone: false,
})
export class RepositoryPageComponent implements OnInit {
  _state = inject(CrossExecutionDashboardState);
  readonly _executionIdFn = inject(EXECUTION_ID);
  private _executionsService = inject(ExecutionsService);
  private _planService = inject(AugmentedPlansService);

  ngOnInit(): void {
    this._executionsService.getExecutionById(this._executionIdFn()).subscribe((execution) => {
      this._state.execution.set(execution);
      this._planService.getPlanById(execution!.planId!).subscribe(plan => this._state.plan.set(plan));
      // TODO refactor
    });
  }
}
