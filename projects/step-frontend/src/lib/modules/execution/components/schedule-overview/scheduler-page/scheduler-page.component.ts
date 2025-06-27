import { Component, DestroyRef, effect, inject, OnInit, Signal, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchedulerPageStateService } from './scheduler-page-state.service';
import { DashboardUrlParamsService } from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { SCHEDULE_ID } from '../../../services/schedule-id.token';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { VIEW_MODE, ViewMode } from '../../../shared/view-mode';

declare const uPlot: any;

interface EntityWithKeywordsStats {
  entity: string;
  timestamp: number;
  statuses: Record<string, number>;
}

@Component({
  selector: 'step-scheduler-page',
  templateUrl: './scheduler-page.component.html',
  styleUrls: ['./scheduler-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    DashboardUrlParamsService,
    {
      provide: SCHEDULE_ID,
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
      useClass: SchedulerPageStateService,
    },
  ],
})
export class SchedulerPageComponent {}
